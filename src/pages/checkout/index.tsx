import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { KeyRound, Search } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { ReceiptModal } from "../../components/sales/ReceiptModal";
import { salesService } from "../../services/salesService";
import type { PendingSale, Sale } from "../../types/sale.types";

const PAYMENT_METHODS = ["Cash", "Card", "Mobile Money", "HMO"] as const;

function fmt(n: number) {
  return `₦${Number(n).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
}

export default function CheckoutPage() {
  const [code, setCode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<string>("Cash");
  const [pendingSale, setPendingSale] = useState<PendingSale | null>(null);
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);

  const lookup = useMutation({
    mutationFn: (code: string) => salesService.getPendingSaleByCode(code).then((r) => r.data),
    onSuccess: (sale) => setPendingSale(sale),
  });

  const complete = useMutation({
    mutationFn: () =>
      salesService
        .completeSale(pendingSale!.code, paymentMethod.toLowerCase().replace(" ", "_"))
        .then((r) => r.data),
    onSuccess: (sale) => {
      setCompletedSale(sale);
      setPendingSale(null);
      setCode("");
      setPaymentMethod("Cash");
    },
  });

  const handleLookup = () => {
    if (code.trim().length === 6) lookup.mutate(code.trim());
  };

  return (
    <div className="mx-auto max-w-2xl p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Complete Sale</h1>
        <p className="text-sm text-slate-500">Enter the 6-digit code from the pharmacist to finalize payment</p>
      </div>

      {!pendingSale ? (
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <label className="mb-2 block text-sm font-semibold text-slate-700">Sale Code</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                onKeyDown={(e) => e.key === "Enter" && handleLookup()}
                className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-lg font-mono tracking-widest shadow-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
              />
            </div>
            <Button onClick={handleLookup} disabled={code.length !== 6 || lookup.isPending}>
              <Search size={18} className="mr-1" />
              {lookup.isPending ? "Looking up…" : "Look Up"}
            </Button>
          </div>
          {lookup.isError && (
            <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
              {(lookup.error as Error).message}
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">Code {pendingSale.code}</h2>
              <button
                onClick={() => setPendingSale(null)}
                className="text-xs font-medium text-slate-500 hover:text-slate-700"
              >
                Change code
              </button>
            </div>
            <div className="divide-y divide-slate-100">
              {pendingSale.items.map((item) => (
                <div key={item.drugId} className="flex justify-between py-2 text-sm">
                  <span className="text-slate-700">
                    {item.drugName}{item.brandName ? ` (${item.brandName})` : ""} × {item.quantity}
                  </span>
                  <span className="font-medium">{fmt(Number(item.subtotal))}</span>
                </div>
              ))}
            </div>
            <div className="space-y-2 border-t border-slate-100 pt-3 text-sm">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span>{fmt(Number(pendingSale.subtotal))}</span>
              </div>
              {Number(pendingSale.discount) > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount</span>
                  <span>-{fmt(Number(pendingSale.discount))}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-slate-100 pt-2 font-bold text-slate-900">
                <span>Total</span>
                <span className="text-lg text-teal-600">{fmt(Number(pendingSale.total))}</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="mb-3 text-sm font-semibold text-slate-700">Payment Method</p>
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

          {complete.isError && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
              {(complete.error as Error).message}
            </p>
          )}
          <Button onClick={() => complete.mutate()} disabled={complete.isPending} className="w-full">
            {complete.isPending ? "Completing…" : "Complete Sale"}
          </Button>
        </div>
      )}

      {completedSale && (
        <ReceiptModal sale={completedSale} onClose={() => setCompletedSale(null)} />
      )}
    </div>
  );
}
