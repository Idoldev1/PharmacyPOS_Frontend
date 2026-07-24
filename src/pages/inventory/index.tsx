import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Plus, X, Package, AlertTriangle, TrendingDown, ShoppingBag, Pencil } from "lucide-react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import {
  inventoryService,
  type CreateDrugPayload,
  type UpdateDrugPayload,
} from "../../services/inventoryService";
import { QUERY_KEYS } from "../../constants/queryKeys";
import { useDebounce } from "../../hooks/useDebounce";
import { usePermissions } from "../../hooks/usePermissions";
import { Permissions } from "../../constants/permissions";
import type { Drug, StockStatus } from "../../types/drug.types";

const CATEGORIES = ["All", "Analgesics", "Antibiotics", "Antifungals", "Antivirals", "Antihypertensives", "Antidiabetics", "Vitamins", "Antiseptics", "Other"];
const FORMS = ["Tablet", "Capsule", "Syrup", "Injection", "Cream", "Ointment", "Drops", "Inhaler", "Suppository", "Other"];

const inputCls =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-slate-600">{label}</label>
      {children}
    </div>
  );
}

function statusBadge(status: StockStatus) {
  const map: Record<StockStatus, { label: string; variant: "success" | "warning" | "danger" | "info" }> = {
    in_stock: { label: "In Stock", variant: "success" },
    low_stock: { label: "Low Stock", variant: "warning" },
    out_of_stock: { label: "Out of Stock", variant: "danger" },
    near_expiry: { label: "Near Expiry", variant: "warning" },
  };
  const { label, variant } = map[status] ?? { label: status, variant: "info" };
  return <Badge variant={variant}>{label}</Badge>;
}

// ─── Brand picker (select existing or add new inline) ─────────────────────────
function BrandPicker({ value, onChange }: { value: string; onChange: (brandId: string) => void }) {
  const qc = useQueryClient();
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");

  const { data: brands = [] } = useQuery({
    queryKey: [QUERY_KEYS.BRANDS],
    queryFn: () => inventoryService.getBrands().then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (name: string) => inventoryService.createBrand(name).then((r) => r.data),
    onSuccess: (brand) => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.BRANDS] });
      onChange(brand.id);
      setAdding(false);
      setNewName("");
    },
  });

  if (adding) {
    return (
      <div className="flex gap-2">
        <input
          className={inputCls}
          autoFocus
          placeholder="New brand name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && newName.trim()) createMutation.mutate(newName.trim());
            if (e.key === "Escape") setAdding(false);
          }}
        />
        <button
          type="button"
          onClick={() => newName.trim() && createMutation.mutate(newName.trim())}
          disabled={createMutation.isPending || !newName.trim()}
          className="shrink-0 rounded-lg bg-teal-600 px-3 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50"
        >
          {createMutation.isPending ? "…" : "Add"}
        </button>
        <button
          type="button"
          onClick={() => setAdding(false)}
          className="shrink-0 rounded-lg border border-slate-200 px-3 text-sm text-slate-600 hover:bg-slate-50"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <select
      className={inputCls}
      value={value}
      onChange={(e) => (e.target.value === "__new__" ? setAdding(true) : onChange(e.target.value))}
    >
      <option value="" disabled>Select brand…</option>
      {brands.map((b) => (
        <option key={b.id} value={b.id}>{b.name}</option>
      ))}
      <option value="__new__">+ Add new brand…</option>
    </select>
  );
}

// ─── Add Drug slide-in panel ───────────────────────────────────────────────────
function AddDrugPanel({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState<CreateDrugPayload>({
    name: "",
    form: "Tablet",
    category: "Analgesics",
    stockQty: 0,
    reorderLevel: 10,
    unitCost: 0,
    sellingPrice: 0,
    brandId: "",
  });
  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: (payload: CreateDrugPayload) =>
      inventoryService.addDrug(payload).then((r) => r.data),
    onSuccess: () => { onSuccess(); onClose(); },
    onError: (e: Error) => setError(e.message),
  });

  const handleSubmit = () => {
    if (!form.name.trim()) return setError("Drug name is required.");
    if (!form.brandId) return setError("Brand is required.");
    if (form.unitCost <= 0) return setError("Unit cost must be greater than 0.");
    if (form.sellingPrice <= 0) return setError("Selling price must be greater than 0.");
    setError("");
    mutation.mutate(form);
  };

  const num = (val: string) => parseFloat(val) || 0;

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <div className="flex w-full max-w-md flex-col bg-white shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="font-bold text-slate-900">Add Drug</h2>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-slate-100">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <Field label="Drug Name *">
            <input className={inputCls} value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Amoxicillin 500mg" />
          </Field>

          <Field label="Brand *">
            <BrandPicker value={form.brandId} onChange={(brandId) => setForm((f) => ({ ...f, brandId }))} />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Generic Name">
              <input className={inputCls} value={form.genericName ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, genericName: e.target.value || undefined }))}
                placeholder="Amoxicillin" />
            </Field>
            <Field label="Strength">
              <input className={inputCls} value={form.strength ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, strength: e.target.value || undefined }))}
                placeholder="500mg" />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Form">
              <select className={inputCls} value={form.form}
                onChange={(e) => setForm((f) => ({ ...f, form: e.target.value }))}>
                {FORMS.map((f) => <option key={f}>{f}</option>)}
              </select>
            </Field>
            <Field label="Category">
              <select className={inputCls} value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
                {CATEGORIES.slice(1).map((c) => <option key={c}>{c}</option>)}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Batch No">
              <input className={inputCls} value={form.batchNo ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, batchNo: e.target.value || undefined }))}
                placeholder="BT-2025-001" />
            </Field>
            <Field label="Expiry Date">
              <input type="date" className={inputCls} value={form.expiryDate ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, expiryDate: e.target.value || undefined }))} />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Stock Quantity *">
              <input type="number" min="0" className={inputCls} value={form.stockQty}
                onChange={(e) => setForm((f) => ({ ...f, stockQty: parseInt(e.target.value) || 0 }))} />
            </Field>
            <Field label="Reorder Level *">
              <input type="number" min="0" className={inputCls} value={form.reorderLevel}
                onChange={(e) => setForm((f) => ({ ...f, reorderLevel: parseInt(e.target.value) || 0 }))} />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Unit Cost (₦) *">
              <input type="number" min="0" step="0.01" className={inputCls} value={form.unitCost || ""}
                onChange={(e) => setForm((f) => ({ ...f, unitCost: num(e.target.value) }))} />
            </Field>
            <Field label="Selling Price (₦) *">
              <input type="number" min="0" step="0.01" className={inputCls} value={form.sellingPrice || ""}
                onChange={(e) => setForm((f) => ({ ...f, sellingPrice: num(e.target.value) }))} />
            </Field>
          </div>

          <Field label="NAFDAC No">
            <input className={inputCls} value={form.nafdacNo ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, nafdacNo: e.target.value || undefined }))}
              placeholder="04-1234" />
          </Field>

          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>}
        </div>

        <div className="border-t border-slate-100 px-6 py-4">
          <Button className="w-full" onClick={handleSubmit} disabled={mutation.isPending}>
            {mutation.isPending ? "Saving…" : "Save Drug"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Edit Drug slide-in panel ───────────────────────────────────────────────────
function EditDrugPanel({ drug, onClose, onSuccess }: { drug: Drug; onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState<UpdateDrugPayload>({
    name: drug.name,
    genericName: drug.genericName,
    strength: drug.strength,
    form: drug.form,
    category: drug.category,
    batchNo: drug.batchNo,
    expiryDate: drug.expiryDate?.slice(0, 10),
    reorderLevel: drug.reorderLevel,
    unitCost: drug.unitCost,
    sellingPrice: drug.sellingPrice,
    nafdacNo: drug.nafdacNo,
    brandId: drug.brandId,
  });
  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: (payload: UpdateDrugPayload) =>
      inventoryService.updateDrug(drug.id, payload).then((r) => r.data),
    onSuccess: () => { onSuccess(); onClose(); },
    onError: (e: Error) => setError(e.message),
  });

  const handleSubmit = () => {
    if (!form.name.trim()) return setError("Drug name is required.");
    if (!form.brandId) return setError("Brand is required.");
    if (form.unitCost <= 0) return setError("Unit cost must be greater than 0.");
    if (form.sellingPrice <= 0) return setError("Selling price must be greater than 0.");
    setError("");
    mutation.mutate(form);
  };

  const num = (val: string) => parseFloat(val) || 0;

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <div className="flex w-full max-w-md flex-col bg-white shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="font-bold text-slate-900">Edit Drug</h2>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-slate-100">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <Field label="Drug Name *">
            <input className={inputCls} value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Amoxicillin 500mg" />
          </Field>

          <Field label="Brand *">
            <BrandPicker value={form.brandId} onChange={(brandId) => setForm((f) => ({ ...f, brandId }))} />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Generic Name">
              <input className={inputCls} value={form.genericName ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, genericName: e.target.value || undefined }))}
                placeholder="Amoxicillin" />
            </Field>
            <Field label="Strength">
              <input className={inputCls} value={form.strength ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, strength: e.target.value || undefined }))}
                placeholder="500mg" />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Form">
              <select className={inputCls} value={form.form}
                onChange={(e) => setForm((f) => ({ ...f, form: e.target.value }))}>
                {FORMS.map((f) => <option key={f}>{f}</option>)}
              </select>
            </Field>
            <Field label="Category">
              <select className={inputCls} value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
                {CATEGORIES.slice(1).map((c) => <option key={c}>{c}</option>)}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Batch No">
              <input className={inputCls} value={form.batchNo ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, batchNo: e.target.value || undefined }))}
                placeholder="BT-2025-001" />
            </Field>
            <Field label="Expiry Date">
              <input type="date" className={inputCls} value={form.expiryDate ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, expiryDate: e.target.value || undefined }))} />
            </Field>
          </div>

          <Field label="Reorder Level *">
            <input type="number" min="0" className={inputCls} value={form.reorderLevel}
              onChange={(e) => setForm((f) => ({ ...f, reorderLevel: parseInt(e.target.value) || 0 }))} />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Unit Cost (₦) *">
              <input type="number" min="0" step="0.01" className={inputCls} value={form.unitCost || ""}
                onChange={(e) => setForm((f) => ({ ...f, unitCost: num(e.target.value) }))} />
            </Field>
            <Field label="Selling Price (₦) *">
              <input type="number" min="0" step="0.01" className={inputCls} value={form.sellingPrice || ""}
                onChange={(e) => setForm((f) => ({ ...f, sellingPrice: num(e.target.value) }))} />
            </Field>
          </div>

          <Field label="NAFDAC No">
            <input className={inputCls} value={form.nafdacNo ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, nafdacNo: e.target.value || undefined }))}
              placeholder="04-1234" />
          </Field>

          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>}
        </div>

        <div className="border-t border-slate-100 px-6 py-4">
          <Button className="w-full" onClick={handleSubmit} disabled={mutation.isPending}>
            {mutation.isPending ? "Saving…" : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Update Stock modal ────────────────────────────────────────────────────────
function UpdateStockModal({ drug, onClose, onSuccess }: { drug: Drug; onClose: () => void; onSuccess: () => void }) {
  const [qty, setQty] = useState(drug.stockQty);
  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: () => inventoryService.updateStock(drug.id, qty),
    onSuccess: () => { onSuccess(); onClose(); },
    onError: (e: Error) => setError(e.message),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        <h2 className="mb-1 font-bold text-slate-900">Update Stock</h2>
        <p className="mb-4 text-sm text-slate-500">{drug.name} — {drug.brandName}</p>
        <div className="mb-4">
          <label className="mb-1 block text-xs font-medium text-slate-600">New Quantity</label>
          <input
            type="number"
            min="0"
            className={inputCls}
            value={qty}
            onChange={(e) => setQty(parseInt(e.target.value) || 0)}
            autoFocus
          />
        </div>
        {error && <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>}
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1" onClick={() => mutation.mutate()} disabled={mutation.isPending}>
            {mutation.isPending ? "Saving…" : "Update"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function InventoryPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [showAdd, setShowAdd] = useState(false);
  const [stockDrug, setStockDrug] = useState<Drug | null>(null);
  const [editDrug, setEditDrug] = useState<Drug | null>(null);
  const debouncedSearch = useDebounce(search, 350);
  const { hasPermission } = usePermissions();
  const canAddDrug = hasPermission(Permissions.Inventory.AddStock);
  const canEditDrug = hasPermission(Permissions.Inventory.EditStock);

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.DRUGS, debouncedSearch, category],
    queryFn: () =>
      inventoryService
        .getDrugs({
          query: debouncedSearch || undefined,
          category: category !== "All" ? category : undefined,
          pageSize: 100,
        })
        .then((r) => r.data),
  });

  const drugs = data?.items ?? [];
  const total = data?.total ?? 0;
  const lowStock = drugs.filter((d) => d.status === "low_stock").length;
  const outOfStock = drugs.filter((d) => d.status === "out_of_stock").length;
  const totalValue = data?.totalValue ?? 0;
  const totalWorth = data?.totalWorth ?? 0;

  return (
    <div className="flex h-full flex-col overflow-hidden bg-slate-50">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white px-6 py-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Inventory</h1>
            <p className="mt-0.5 text-sm text-slate-500">{total} drug(s) total</p>
          </div>
          {canAddDrug && (
            <Button onClick={() => setShowAdd(true)}>
              <Plus size={16} /> Add Drug
            </Button>
          )}
        </div>

        {/* Search + filter */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search drugs…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20"
            />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  category === c
                    ? "bg-teal-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 min-h-0 overflow-auto px-6 py-4">
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full min-w-[1040px] text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {["Drug Name", "Brand", "Category", "Strength/Form", "Batch No", "Expiry Date", "Stock", "Reorder", "Unit Cost", "Selling Price", "Status", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={12} className="px-4 py-8 text-center text-slate-400">Loading inventory…</td>
                </tr>
              ) : drugs.length === 0 ? (
                <tr>
                  <td colSpan={12} className="px-4 py-8 text-center text-slate-400">
                    {search || category !== "All" ? "No drugs match your filters." : "No drugs in inventory."}
                  </td>
                </tr>
              ) : (
                drugs.map((d) => (
                  <tr
                    key={d.id}
                    className="group cursor-pointer hover:bg-slate-50"
                    onClick={() => setStockDrug(d)}
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{d.name}</div>
                      {d.genericName && (
                        <div className="text-xs text-slate-400">{d.genericName}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{d.brandName}</td>
                    <td className="px-4 py-3 text-slate-600">{d.category}</td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                      {[d.strength, d.form].filter(Boolean).join(" · ")}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">{d.batchNo ?? "—"}</td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                      {d.expiryDate
                        ? new Date(d.expiryDate).toLocaleDateString("en-NG")
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-medium ${d.stockQty === 0 ? "text-red-600" : d.stockQty <= d.reorderLevel ? "text-amber-600" : "text-slate-900"}`}>
                        {d.stockQty}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{d.reorderLevel}</td>
                    <td className="px-4 py-3 text-slate-600">₦{Number(d.unitCost).toLocaleString()}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">₦{Number(d.sellingPrice).toLocaleString()}</td>
                    <td className="px-4 py-3">{statusBadge(d.status)}</td>
                    <td className="px-4 py-3">
                      {canEditDrug && (
                        <button
                          onClick={(e) => { e.stopPropagation(); setEditDrug(d); }}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                          title="Edit drug"
                        >
                          <Pencil size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="border-t border-slate-200 bg-white px-6 py-4">
        <div className="grid grid-cols-5 gap-4">
          {[
            { icon: Package, label: "Total Items", value: total, color: "text-teal-600", bg: "bg-teal-50" },
            { icon: AlertTriangle, label: "Low Stock", value: lowStock, color: "text-amber-600", bg: "bg-amber-50" },
            { icon: TrendingDown, label: "Out of Stock", value: outOfStock, color: "text-red-600", bg: "bg-red-50" },
            {
              icon: Package,
              label: "Total Value",
              value: `₦${Number(totalValue).toLocaleString()}`,
              color: "text-indigo-600",
              bg: "bg-indigo-50",
            },
            {
              icon: ShoppingBag,
              label: "Total Worth",
              value: `₦${Number(totalWorth).toLocaleString()}`,
              color: "text-purple-600",
              bg: "bg-purple-50",
            },
          ].map(({ icon: Icon, label, value, color, bg }) => (
            <div key={label} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${bg}`}>
                <Icon size={18} className={color} />
              </div>
              <div>
                <p className="text-xs text-slate-500">{label}</p>
                <p className="font-bold text-slate-900">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showAdd && (
        <AddDrugPanel
          onClose={() => setShowAdd(false)}
          onSuccess={() => qc.invalidateQueries({ queryKey: [QUERY_KEYS.DRUGS] })}
        />
      )}

      {editDrug && (
        <EditDrugPanel
          drug={editDrug}
          onClose={() => setEditDrug(null)}
          onSuccess={() => qc.invalidateQueries({ queryKey: [QUERY_KEYS.DRUGS] })}
        />
      )}

      {stockDrug && (
        <UpdateStockModal
          drug={stockDrug}
          onClose={() => setStockDrug(null)}
          onSuccess={() => {
            qc.invalidateQueries({ queryKey: [QUERY_KEYS.DRUGS] });
            setStockDrug(null);
          }}
        />
      )}
    </div>
  );
}
