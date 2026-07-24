import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Plus, Minus, Trash2, Receipt, KeyRound, X, Clock } from "lucide-react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { useCartStore } from "../../store/cartStore";
import { inventoryService } from "../../services/inventoryService";
import { salesService } from "../../services/salesService";
import { patientService } from "../../services/patientService";
import { useDebounce } from "../../hooks/useDebounce";
import { usePermissions } from "../../hooks/usePermissions";
import { Permissions } from "../../constants/permissions";
import { QUERY_KEYS } from "../../constants/queryKeys";
import type { Drug } from "../../types/drug.types";
import type { PendingSale } from "../../types/sale.types";
import type { Patient } from "../../types/patient.types";

function fmt(n: number) {
  return `₦${Number(n).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
}

function stockVariant(drug: Drug) {
  if (drug.availableQty === 0) return "danger" as const;
  if (drug.availableQty <= drug.reorderLevel) return "warning" as const;
  return "success" as const;
}

function minutesLeft(expiresAt: string) {
  const ms = new Date(expiresAt).getTime() - Date.now();
  return Math.max(0, Math.round(ms / 60000));
}

// ─── Sale code overlay ───────────────────────────────────────────────────────
function SaleCodeModal({ sale, onClose }: { sale: PendingSale; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <div className="flex items-center gap-3">
            <KeyRound className="text-teal-600" size={24} />
            <div>
              <h2 className="font-bold text-slate-900">Sale Initiated</h2>
              <p className="text-xs text-slate-500">Give this code to the customer</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-slate-100">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        <div className="p-6 text-center">
          <p className="text-4xl font-bold tracking-[0.3em] text-teal-600">{sale.code}</p>
          <p className="mt-2 text-xs text-slate-500">
            Expires in {minutesLeft(sale.expiresAt)} minute(s) — the cashier will need this code to complete the sale.
          </p>
        </div>

        <div className="divide-y divide-slate-100 px-5">
          {sale.items.map((item) => (
            <div key={item.drugId} className="flex justify-between py-2 text-sm">
              <span className="text-slate-700">
                {item.drugName}{item.brandName ? ` (${item.brandName})` : ""} × {item.quantity}
              </span>
              <span className="font-medium">{fmt(Number(item.subtotal))}</span>
            </div>
          ))}
        </div>

        <div className="space-y-2 border-t border-slate-100 px-5 pb-2 pt-3 text-sm">
          {Number(sale.discount) > 0 && (
            <div className="flex justify-between text-emerald-600">
              <span>Discount</span>
              <span>-{fmt(Number(sale.discount))}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-slate-900 pt-2 border-t border-slate-100">
            <span>Total</span>
            <span className="text-lg text-teal-600">{fmt(Number(sale.total))}</span>
          </div>
        </div>

        <div className="p-5">
          <Button className="w-full" onClick={onClose}>
            New Sale
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function SalesPage() {
  const [search, setSearch] = useState("");
  const [discountPct, setDiscountPct] = useState(0);
  const [initiatedSale, setInitiatedSale] = useState<PendingSale | null>(null);
  const [patientSearch, setPatientSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const debouncedSearch = useDebounce(search, 350);
  const debouncedPatientSearch = useDebounce(patientSearch, 350);
  const { items, addItem, removeItem, updateQty, clearCart } = useCartStore();
  const { hasPermission } = usePermissions();
  const queryClient = useQueryClient();

  const subtotal = items.reduce((s, i) => s + i.subtotal, 0);
  const discountAmount = (subtotal * discountPct) / 100;
  const total = subtotal - discountAmount;

  // Fetch drug list (live search)
  const { data: drugResult, isLoading: drugsLoading } = useQuery({
    queryKey: [QUERY_KEYS.DRUGS, debouncedSearch],
    queryFn: () =>
      inventoryService.getDrugs({ query: debouncedSearch || undefined, pageSize: 30 }).then((r) => r.data),
    staleTime: 30_000,
  });

  const drugs = drugResult?.items ?? [];

  // Patient search (optional link for the sale)
  const { data: patientResult } = useQuery({
    queryKey: [QUERY_KEYS.PATIENTS, "sale-search", debouncedPatientSearch],
    queryFn: () =>
      patientService.getPatients({ q: debouncedPatientSearch, pageSize: 5 }).then((r) => r.data),
    enabled: debouncedPatientSearch.trim().length > 0,
  });

  const patientMatches = patientResult?.items ?? [];

  const canCancelPending = hasPermission(Permissions.Sales.Cancel);

  // Pending sales this pharmacist/branch has initiated (for manual cancellation)
  const { data: pendingSales } = useQuery({
    queryKey: [QUERY_KEYS.PENDING_SALES],
    queryFn: () => salesService.getPendingSales().then((r) => r.data),
    enabled: canCancelPending,
    refetchInterval: 30_000,
  });

  // Initiate-sale mutation
  const initiate = useMutation({
    mutationFn: () =>
      salesService
        .initiateSale(
          items.map((i) => ({ drugId: i.drugId, quantity: i.quantity })),
          discountAmount,
          selectedPatient?.id
        )
        .then((r) => r.data),
    onSuccess: (sale) => {
      setInitiatedSale(sale);
      clearCart();
      setDiscountPct(0);
      setSelectedPatient(null);
      setPatientSearch("");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DRUGS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PENDING_SALES] });
    },
  });

  const cancelPending = useMutation({
    mutationFn: (id: string) => salesService.cancelPendingSale(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PENDING_SALES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DRUGS] });
    },
  });

  const handleAddToCart = (drug: Drug) => {
    if (drug.availableQty === 0) return;
    addItem({
      drugId: drug.id,
      drugName: drug.name,
      brandName: drug.brandName,
      quantity: 1,
      unitPrice: drug.sellingPrice,
      subtotal: drug.sellingPrice,
    });
  };

  return (
    <div className="flex h-[calc(100vh-5rem)] overflow-hidden">
      {/* ── Left panel: drug catalogue ── */}
      <div className="flex flex-1 flex-col overflow-hidden bg-slate-50 p-6">
        <div className="mb-5">
          <h1 className="text-2xl font-bold text-slate-900">New Sale</h1>
          <p className="text-sm text-slate-500">Search and add drugs to cart</p>
        </div>

        {/* Search */}
        <div className="relative mb-5">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search by drug name or category…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm shadow-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
          />
        </div>

        {/* Drug grid */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {drugsLoading ? (
            <div className="py-10 text-center text-sm text-slate-400">Loading drugs…</div>
          ) : drugs.length === 0 ? (
            <div className="py-10 text-center text-sm text-slate-400">
              {search ? "No drugs match your search." : "No drugs in inventory."}
            </div>
          ) : (
            drugs.map((drug) => (
              <div
                key={drug.id}
                onClick={() => handleAddToCart(drug)}
                className={`flex cursor-pointer items-center justify-between rounded-2xl bg-white p-4 shadow-sm transition-all hover:shadow-md hover:scale-[1.005] ${
                  drug.availableQty === 0 ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 truncate">{drug.name}</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {[drug.brandName, drug.strength, drug.form, drug.category].filter(Boolean).join(" • ")}
                  </p>
                </div>
                <div className="ml-4 flex items-center gap-3 shrink-0">
                  <Badge variant={stockVariant(drug)}>
                    {drug.availableQty === 0 ? "Out of stock" : `${drug.availableQty} available`}
                  </Badge>
                  <span className="font-bold text-slate-900 text-sm w-24 text-right">
                    {fmt(drug.sellingPrice)}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(drug);
                    }}
                    disabled={drug.availableQty === 0}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-40 transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pending sales (cancellable) */}
        {canCancelPending && pendingSales && pendingSales.length > 0 && (
          <div className="mt-5 shrink-0 rounded-2xl bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold text-slate-900">Pending Sales</h3>
            <div className="space-y-2">
              {pendingSales.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-teal-600">{p.code}</span>
                    <span className="text-slate-500">{p.items.length} item(s) · {fmt(p.total)}</span>
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <Clock size={12} /> {minutesLeft(p.expiresAt)}m left
                    </span>
                  </div>
                  <button
                    onClick={() => cancelPending.mutate(p.id)}
                    disabled={cancelPending.isPending}
                    className="rounded-lg px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                  >
                    Cancel
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Right panel: cart ── */}
      <div className="flex w-[400px] shrink-0 flex-col bg-white shadow-xl">
        {/* Cart header */}
        <div className="bg-gradient-to-r from-teal-600/10 to-amber-500/10 p-5">
          <h2 className="text-xl font-bold text-slate-900">Shopping Cart</h2>
          <p className="mt-0.5 text-sm text-slate-500">{items.length} item(s)</p>
        </div>

        {/* Patient (optional) */}
        <div className="border-b border-slate-100 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Patient Details
          </p>
          {selectedPatient ? (
            <div className="flex items-center justify-between rounded-xl bg-teal-50 px-3 py-2 dark:bg-teal-950/40">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">{selectedPatient.fullName}</p>
                <p className="text-xs text-slate-500">{selectedPatient.phone}</p>
              </div>
              <button
                onClick={() => setSelectedPatient(null)}
                className="shrink-0 rounded-lg p-1 text-slate-400 transition-colors hover:bg-white hover:text-red-500"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input
                type="text"
                placeholder="Search patient by name or ID (optional)…"
                value={patientSearch}
                onChange={(e) => setPatientSearch(e.target.value)}
                className="w-full rounded-lg border border-slate-200 py-2 pl-8 pr-3 text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20"
              />
              {debouncedPatientSearch.trim().length > 0 && (
                <div className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg">
                  {patientMatches.length === 0 ? (
                    <p className="px-3 py-2 text-xs text-slate-400">No patients found.</p>
                  ) : (
                    patientMatches.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          setSelectedPatient(p);
                          setPatientSearch("");
                        }}
                        className="block w-full px-3 py-2 text-left text-sm hover:bg-slate-50"
                      >
                        <span className="font-medium text-slate-900">{p.fullName}</span>
                        <span className="ml-2 text-xs text-slate-500">{p.phone}</span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Cart items */}
        <div className="flex-1 overflow-y-auto space-y-3 p-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                <Receipt size={28} className="text-slate-400" />
              </div>
              <p className="text-sm font-medium text-slate-500">Cart is empty</p>
              <p className="mt-1 text-xs text-slate-400">Add items to get started</p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.drugId}
                className="rounded-xl bg-slate-50 p-3 transition-colors hover:bg-slate-100"
              >
                <div className="mb-2 flex items-start justify-between">
                  <div className="flex-1 min-w-0 pr-2">
                    <p className="text-sm font-semibold text-slate-900 truncate">{item.drugName}</p>
                    <p className="text-xs text-slate-500">
                      {item.brandName ? `${item.brandName} · ` : ""}{fmt(item.unitPrice)} each
                    </p>
                  </div>
                  <button
                    onClick={() => removeItem(item.drugId)}
                    className="rounded-lg p-1 text-red-500 transition-colors hover:bg-red-50"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        if (item.quantity === 1) removeItem(item.drugId);
                        else updateQty(item.drugId, item.quantity - 1);
                      }}
                      className="flex h-7 w-7 items-center justify-center rounded-lg bg-white shadow-sm hover:bg-teal-50 hover:text-teal-600 transition-colors"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                    <button
                      onClick={() => updateQty(item.drugId, item.quantity + 1)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg bg-white shadow-sm hover:bg-teal-50 hover:text-teal-600 transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <span className="text-sm font-bold text-teal-600">{fmt(item.subtotal)}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Totals + actions */}
        <div className="border-t border-slate-100 p-5 space-y-4">
          {/* Subtotal row */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal</span>
              <span className="font-medium text-slate-700">{fmt(subtotal)}</span>
            </div>

            {/* Discount */}
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                max={100}
                placeholder="Discount %"
                value={discountPct || ""}
                onChange={(e) => setDiscountPct(Math.min(100, Math.max(0, Number(e.target.value))))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30"
              />
            </div>
            {discountPct > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Discount ({discountPct}%)</span>
                <span className="font-medium">-{fmt(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-slate-100 pt-2 font-bold text-slate-900">
              <span>Total</span>
              <span className="text-xl text-teal-600">{fmt(total)}</span>
            </div>
          </div>

          {/* Initiate sale */}
          {initiate.isError && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
              {(initiate.error as Error).message}
            </p>
          )}
          <Button
            onClick={() => initiate.mutate()}
            disabled={items.length === 0 || initiate.isPending}
            className="w-full"
          >
            {initiate.isPending ? "Processing…" : "Initiate Sale"}
          </Button>
          <p className="text-center text-xs text-slate-400">
            Generates a code for the cashier to complete this sale
          </p>
        </div>
      </div>

      {/* Sale code modal */}
      {initiatedSale && (
        <SaleCodeModal sale={initiatedSale} onClose={() => setInitiatedSale(null)} />
      )}
    </div>
  );
}
