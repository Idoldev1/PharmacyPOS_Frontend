import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Search, Plus, Minus, Trash2, Receipt, CheckCircle, X } from "lucide-react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { useCartStore } from "../../store/cartStore";
import { inventoryService } from "../../services/inventoryService";
import { salesService } from "../../services/salesService";
import { useDebounce } from "../../hooks/useDebounce";
import { QUERY_KEYS } from "../../constants/queryKeys";
import type { Drug } from "../../types/drug.types";
import type { Sale } from "../../types/sale.types";

const PAYMENT_METHODS = ["Cash", "Card", "Mobile Money", "HMO"] as const;

function fmt(n: number) {
  return `₦${Number(n).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
}

function stockVariant(drug: Drug) {
  if (drug.stockQty === 0) return "danger" as const;
  if (drug.stockQty <= drug.reorderLevel) return "warning" as const;
  return "success" as const;
}

// ─── Receipt overlay ─────────────────────────────────────────────────────────
function ReceiptModal({ sale, onClose }: { sale: Sale; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <div className="flex items-center gap-3">
            <CheckCircle className="text-teal-600" size={24} />
            <div>
              <h2 className="font-bold text-slate-900">Sale Complete</h2>
              <p className="text-xs text-slate-500">{sale.receiptNo}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-slate-100">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        <div className="divide-y divide-slate-100 p-5">
          {sale.items.map((item) => (
            <div key={item.drugId} className="flex justify-between py-2 text-sm">
              <span className="text-slate-700">
                {item.drugName} × {item.quantity}
              </span>
              <span className="font-medium">{fmt(Number(item.subtotal))}</span>
            </div>
          ))}
        </div>

        <div className="space-y-2 border-t border-slate-100 px-5 pb-2 pt-3 text-sm">
          <div className="flex justify-between text-slate-500">
            <span>Subtotal</span>
            <span>{fmt(Number(sale.subtotal))}</span>
          </div>
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
          <div className="flex justify-between text-slate-500">
            <span>Payment</span>
            <span className="capitalize">{sale.paymentMethod}</span>
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
  const [paymentMethod, setPaymentMethod] = useState<string>("Cash");
  const [discountPct, setDiscountPct] = useState(0);
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);

  const debouncedSearch = useDebounce(search, 350);
  const { items, addItem, removeItem, updateQty, clearCart } = useCartStore();

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

  // Checkout mutation
  const checkout = useMutation({
    mutationFn: () =>
      salesService
        .createSale(
          items.map((i) => ({ drugId: i.drugId, quantity: i.quantity })),
          paymentMethod.toLowerCase().replace(" ", "_"),
          discountAmount
        )
        .then((r) => r.data),
    onSuccess: (sale) => {
      setCompletedSale(sale);
      clearCart();
      setDiscountPct(0);
      setPaymentMethod("Cash");
    },
  });

  const handleAddToCart = (drug: Drug) => {
    if (drug.stockQty === 0) return;
    addItem({
      drugId: drug.id,
      drugName: drug.name,
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
                  drug.stockQty === 0 ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 truncate">{drug.name}</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {[drug.strength, drug.form, drug.category].filter(Boolean).join(" • ")}
                  </p>
                </div>
                <div className="ml-4 flex items-center gap-3 shrink-0">
                  <Badge variant={stockVariant(drug)}>
                    {drug.stockQty === 0 ? "Out of stock" : `${drug.stockQty} in stock`}
                  </Badge>
                  <span className="font-bold text-slate-900 text-sm w-24 text-right">
                    {fmt(drug.sellingPrice)}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(drug);
                    }}
                    disabled={drug.stockQty === 0}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-40 transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Right panel: cart ── */}
      <div className="flex w-[400px] shrink-0 flex-col bg-white shadow-xl">
        {/* Cart header */}
        <div className="bg-gradient-to-r from-teal-600/10 to-amber-500/10 p-5">
          <h2 className="text-xl font-bold text-slate-900">Shopping Cart</h2>
          <p className="mt-0.5 text-sm text-slate-500">{items.length} item(s)</p>
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
                    <p className="text-xs text-slate-500">{fmt(item.unitPrice)} each</p>
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

          {/* Payment method */}
          <div>
            <p className="mb-2 text-sm font-semibold text-slate-700">Payment Method</p>
            <div className="grid grid-cols-2 gap-2">
              {PAYMENT_METHODS.map((m) => (
                <button
                  key={m}
                  onClick={() => setPaymentMethod(m)}
                  className={`rounded-xl px-3 py-2 text-sm font-semibold transition-all ${
                    paymentMethod === m
                      ? "bg-teal-600 text-white shadow-md shadow-teal-600/30"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Checkout button */}
          {checkout.isError && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
              {(checkout.error as Error).message}
            </p>
          )}
          <Button
            onClick={() => checkout.mutate()}
            disabled={items.length === 0 || checkout.isPending}
            className="w-full"
          >
            {checkout.isPending ? "Processing…" : "Complete Sale"}
          </Button>
        </div>
      </div>

      {/* Receipt modal */}
      {completedSale && (
        <ReceiptModal sale={completedSale} onClose={() => setCompletedSale(null)} />
      )}
    </div>
  );
}
