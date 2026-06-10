import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Phone, Mail, X, Trash2 } from "lucide-react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import {
  supplierService,
  type Supplier,
  type CreateSupplierRequest,
  type CreatePurchaseOrderRequest,
} from "../../services/supplierService";
import { inventoryService } from "../../services/inventoryService";
import { QUERY_KEYS } from "../../constants/queryKeys";

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

// ─── Add Supplier panel ────────────────────────────────────────────────────────
function AddSupplierPanel({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState<CreateSupplierRequest>({
    name: "", contactPerson: "", phone: "", email: "",
  });
  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: (payload: CreateSupplierRequest) =>
      supplierService.createSupplier(payload).then((r) => r.data),
    onSuccess: () => { onSuccess(); onClose(); },
    onError: (e: Error) => setError(e.message),
  });

  const handleSubmit = () => {
    if (!form.name.trim()) return setError("Supplier name is required.");
    if (!form.contactPerson.trim()) return setError("Contact person is required.");
    if (!form.phone.trim()) return setError("Phone is required.");
    if (!form.email.trim()) return setError("Email is required.");
    setError("");
    mutation.mutate(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-bold text-slate-900">New Supplier</h2>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-slate-100">
            <X size={18} className="text-slate-500" />
          </button>
        </div>
        <div className="space-y-4">
          <Field label="Supplier Name *">
            <input className={inputCls} value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="May & Baker Nigeria Plc" />
          </Field>
          <Field label="Contact Person *">
            <input className={inputCls} value={form.contactPerson}
              onChange={(e) => setForm((f) => ({ ...f, contactPerson: e.target.value }))}
              placeholder="Kunle Adeola" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Phone *">
              <input className={inputCls} value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="08011122233" />
            </Field>
            <Field label="Email *">
              <input className={inputCls} value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="contact@supplier.com" />
            </Field>
          </div>
          <Field label="Address">
            <input className={inputCls} value={form.address ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, address: e.target.value || undefined }))}
              placeholder="12 Lagos Road, Ikeja" />
          </Field>
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>}
          <div className="flex gap-3 pt-1">
            <Button variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button className="flex-1" onClick={handleSubmit} disabled={mutation.isPending}>
              {mutation.isPending ? "Saving…" : "Save Supplier"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Purchase Order builder ────────────────────────────────────────────────────
function PurchaseOrderPanel({ supplier }: { supplier: Supplier }) {
  const qc = useQueryClient();
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split("T")[0]);
  const [expectedDelivery, setExpectedDelivery] = useState("");
  const [items, setItems] = useState<{ drugId: string; drugName: string; quantity: number; unitCost: number }[]>([]);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const { data: drugsData } = useQuery({
    queryKey: [QUERY_KEYS.DRUGS],
    queryFn: () => inventoryService.getDrugs({ pageSize: 200 }).then((r) => r.data),
  });

  const { data: orders = [], refetch: refetchOrders } = useQuery({
    queryKey: ["supplier-orders", supplier.id],
    queryFn: () => supplierService.getOrders(supplier.id).then((r) => r.data),
  });

  const drugs = drugsData?.items ?? [];

  const createMutation = useMutation({
    mutationFn: (payload: CreatePurchaseOrderRequest) =>
      supplierService.createOrder(supplier.id, payload).then((r) => r.data),
    onSuccess: () => {
      setItems([]);
      setSent(false);
      refetchOrders();
      qc.invalidateQueries({ queryKey: ["supplier-orders", supplier.id] });
    },
    onError: (e: Error) => setError(e.message),
  });

  const sendMutation = useMutation({
    mutationFn: (orderId: string) => supplierService.sendOrder(orderId),
    onSuccess: () => refetchOrders(),
  });

  const addItem = () => {
    if (drugs.length === 0) return;
    const first = drugs[0];
    setItems((prev) => [
      ...prev,
      { drugId: first.id, drugName: first.name, quantity: 100, unitCost: first.unitCost },
    ]);
  };

  const removeItem = (i: number) => setItems((prev) => prev.filter((_, idx) => idx !== i));

  const updateItem = (i: number, field: string, value: string | number) => {
    setItems((prev) => prev.map((item, idx) => {
      if (idx !== i) return item;
      if (field === "drugId") {
        const drug = drugs.find((d) => d.id === value);
        return drug
          ? { ...item, drugId: drug.id, drugName: drug.name, unitCost: drug.unitCost }
          : item;
      }
      return { ...item, [field]: value };
    }));
  };

  const total = items.reduce((sum, item) => sum + item.quantity * item.unitCost, 0);

  const handleSaveDraft = () => {
    if (items.length === 0) return setError("Add at least one item.");
    setError("");
    createMutation.mutate({ orderDate, expectedDelivery: expectedDelivery || undefined, items });
  };

  const handleSendOrder = () => {
    setSent(true);
    handleSaveDraft();
  };

  const orderStatusVariant = (status: string) =>
    status === "sent" ? "success" : status === "received" ? "info" : "warning";

  return (
    <div className="space-y-6">
      {/* Supplier info cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="mb-1 text-xs text-slate-500">Contact Person</p>
          <p className="font-medium text-slate-900">{supplier.contactPerson}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="mb-1 flex items-center gap-1 text-xs text-slate-500">
            <Phone size={12} /> Phone
          </p>
          <p className="font-medium text-slate-900">{supplier.phone}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="mb-1 flex items-center gap-1 text-xs text-slate-500">
            <Mail size={12} /> Email
          </p>
          <p className="font-medium text-slate-900 text-sm">{supplier.email}</p>
        </div>
      </div>

      {/* New PO form */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h3 className="font-semibold text-slate-900">New Purchase Order</h3>
          <Badge variant="warning">Draft</Badge>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Order Date">
              <input type="date" className={inputCls} value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)} />
            </Field>
            <Field label="Expected Delivery">
              <input type="date" className={inputCls} value={expectedDelivery}
                onChange={(e) => setExpectedDelivery(e.target.value)} />
            </Field>
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between">
              <label className="text-sm font-medium text-slate-700">Order Items</label>
              <Button size="sm" onClick={addItem} disabled={drugs.length === 0}>
                <Plus size={15} /> Add Item
              </Button>
            </div>

            <div className="space-y-3">
              {items.map((item, i) => (
                <div key={i} className="flex items-end gap-3 rounded-lg bg-slate-50 p-3">
                  <div className="flex-1">
                    <label className="mb-1 block text-xs font-medium text-slate-600">Drug</label>
                    <select
                      value={item.drugId}
                      onChange={(e) => updateItem(i, "drugId", e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-500"
                    >
                      {drugs.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}{d.strength ? ` ${d.strength}` : ""} — ₦{Number(d.unitCost).toLocaleString()}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="w-28">
                    <label className="mb-1 block text-xs font-medium text-slate-600">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      className={inputCls}
                      value={item.quantity}
                      onChange={(e) => updateItem(i, "quantity", parseInt(e.target.value) || 1)}
                    />
                  </div>
                  <div className="w-32">
                    <label className="mb-1 block text-xs font-medium text-slate-600">Subtotal</label>
                    <div className="flex h-9 items-center font-semibold text-slate-900">
                      ₦{(item.quantity * item.unitCost).toLocaleString()}
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(i)}
                    className="mb-0.5 flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
              {items.length === 0 && (
                <div className="py-8 text-center text-sm text-slate-400">
                  No items added. Click "Add Item" to start building your order.
                </div>
              )}
            </div>
          </div>

          {items.length > 0 && (
            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
              <span className="font-semibold text-slate-900">Total Order Value</span>
              <span className="text-2xl font-bold text-teal-700">₦{total.toLocaleString()}</span>
            </div>
          )}

          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>}

          <div className="flex gap-3">
            <Button className="flex-1" onClick={handleSendOrder}
              disabled={createMutation.isPending || items.length === 0}>
              Send Order
            </Button>
            <Button variant="secondary" className="flex-1" onClick={handleSaveDraft}
              disabled={createMutation.isPending || items.length === 0}>
              Save Draft
            </Button>
          </div>
        </div>
      </div>

      {/* Past orders */}
      {orders.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <div className="border-b border-slate-100 px-5 py-4">
            <h3 className="font-semibold text-slate-900">Order History</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {orders.map((order) => (
              <div key={order.id} className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className="font-mono text-sm font-medium text-slate-900">{order.poNumber}</p>
                  <p className="text-xs text-slate-500">
                    {new Date(order.orderDate).toLocaleDateString("en-NG")} · {order.items.length} item(s)
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-medium text-slate-900">₦{Number(order.total).toLocaleString()}</span>
                  <Badge variant={orderStatusVariant(order.status)}>{order.status}</Badge>
                  {order.status === "draft" && (
                    <Button size="sm" onClick={() => sendMutation.mutate(order.id)}
                      disabled={sendMutation.isPending}>
                      Send
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function SuppliersPage() {
  const qc = useQueryClient();
  const [selected, setSelected] = useState<Supplier | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const { data: suppliers = [], isLoading } = useQuery({
    queryKey: [QUERY_KEYS.SUPPLIERS],
    queryFn: () => supplierService.getSuppliers().then((r) => r.data),
  });

  return (
    <div className="flex h-[calc(100vh-5rem)] overflow-hidden">
      {/* Left sidebar */}
      <div className="flex w-80 shrink-0 flex-col border-r border-slate-100 bg-white overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="font-bold text-slate-900">Suppliers</h2>
          <Button size="sm" onClick={() => setShowAdd(true)}>
            <Plus size={15} /> Add
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {isLoading ? (
            <div className="p-5 text-center text-sm text-slate-400">Loading…</div>
          ) : suppliers.length === 0 ? (
            <div className="p-5 text-center text-sm text-slate-400">No suppliers yet.</div>
          ) : (
            suppliers.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelected(s)}
                className={`w-full p-4 text-left hover:bg-slate-50 transition-colors ${
                  selected?.id === s.id ? "bg-teal-50 border-l-2 border-teal-600" : ""
                }`}
              >
                <div className="font-medium text-sm text-slate-900">{s.name}</div>
                <div className="mt-0.5 text-xs text-slate-500">{s.contactPerson}</div>
                <div className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                  <Phone size={11} /> {s.phone}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 overflow-y-auto bg-slate-50 p-6">
        {!selected ? (
          <div className="flex h-full items-center justify-center text-center">
            <div>
              <p className="text-sm text-slate-400">Select a supplier to manage purchase orders</p>
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-2xl space-y-2">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{selected.name}</h1>
              <p className="mt-0.5 text-sm text-slate-500">Create and manage purchase orders</p>
            </div>
            <PurchaseOrderPanel supplier={selected} />
          </div>
        )}
      </div>

      {showAdd && (
        <AddSupplierPanel
          onClose={() => setShowAdd(false)}
          onSuccess={() => qc.invalidateQueries({ queryKey: [QUERY_KEYS.SUPPLIERS] })}
        />
      )}
    </div>
  );
}
