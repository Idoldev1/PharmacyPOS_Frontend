import { CheckCircle, X } from "lucide-react";
import { Button } from "../ui/Button";
import type { Sale } from "../../types/sale.types";

function fmt(n: number) {
  return `₦${Number(n).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
}

export function ReceiptModal({ sale, onClose }: { sale: Sale; onClose: () => void }) {
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

        <div className="flex justify-between border-b border-slate-100 px-5 pb-3 pt-4 text-sm">
          <span className="text-slate-500">Customer</span>
          <span className="font-medium text-slate-900">
            {sale.patientId ? sale.patientName ?? `PAT-${sale.patientId.slice(0, 8).toUpperCase()}` : "Walk-in Customer"}
          </span>
        </div>

        <div className="divide-y divide-slate-100 p-5">
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
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
