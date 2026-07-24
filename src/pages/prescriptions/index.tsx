import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  Check,
  FileText,
  Flag,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { prescriptionService } from "../../services/prescriptionService";
import { QUERY_KEYS } from "../../constants/queryKeys";
import { useDebounce } from "../../hooks/useDebounce";
import type {
  Prescription,
  PrescriptionStatus,
  CreatePrescriptionRequest,
  CreatePrescriptionLineRequest,
} from "../../types/prescription.types";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function statusVariant(status: PrescriptionStatus) {
  const map: Record<PrescriptionStatus, "warning" | "info" | "success" | "danger"> = {
    Pending: "warning",
    Verified: "info",
    Dispensed: "success",
    Flagged: "danger",
  };
  return map[status];
}

const STATUS_TABS = ["All", "Pending", "Verified", "Dispensed", "Flagged"] as const;

// ─── New Prescription form (slide-in panel) ───────────────────────────────────
function NewPrescriptionPanel({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const emptyLine = (): CreatePrescriptionLineRequest => ({
    drugName: "",
    dosage: "",
    quantity: 1,
  });

  const [form, setForm] = useState<CreatePrescriptionRequest>({
    patientName: "",
    doctorName: "",
    prescribedDate: new Date().toISOString().slice(0, 10),
    lines: [emptyLine()],
  });
  const [error, setError] = useState("");

  const createMutation = useMutation({
    mutationFn: (payload: CreatePrescriptionRequest) =>
      prescriptionService.createPrescription(payload).then((r) => r.data),
    onSuccess: () => {
      onSuccess();
      onClose();
    },
    onError: (e: Error) => setError(e.message),
  });

  const updateLine = (idx: number, patch: Partial<CreatePrescriptionLineRequest>) =>
    setForm((f) => ({
      ...f,
      lines: f.lines.map((l, i) => (i === idx ? { ...l, ...patch } : l)),
    }));

  const addLine = () => setForm((f) => ({ ...f, lines: [...f.lines, emptyLine()] }));
  const removeLine = (idx: number) =>
    setForm((f) => ({ ...f, lines: f.lines.filter((_, i) => i !== idx) }));

  const handleSubmit = () => {
    if (!form.patientName.trim()) return setError("Patient name is required.");
    if (!form.doctorName.trim()) return setError("Doctor name is required.");
    if (form.lines.some((l) => !l.drugName.trim()))
      return setError("All drug names must be filled in.");
    setError("");
    createMutation.mutate({
      ...form,
      prescribedDate: new Date(form.prescribedDate).toISOString(),
    });
  };

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      {/* backdrop */}
      <div className="flex-1 bg-black/40" onClick={onClose} />

      <div className="flex w-full max-w-lg flex-col bg-white shadow-2xl overflow-hidden">
        {/* header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="font-bold text-slate-900">New Prescription</h2>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-slate-100">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        {/* body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Patient Name *">
              <input
                className={inputCls}
                value={form.patientName}
                onChange={(e) => setForm((f) => ({ ...f, patientName: e.target.value }))}
                placeholder="John Doe"
              />
            </Field>
            <Field label="Patient ID (optional)">
              <input
                className={inputCls}
                value={form.patientId ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, patientId: e.target.value || undefined }))}
                placeholder="P-12345"
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Doctor Name *">
              <input
                className={inputCls}
                value={form.doctorName}
                onChange={(e) => setForm((f) => ({ ...f, doctorName: e.target.value }))}
                placeholder="Dr. Smith"
              />
            </Field>
            <Field label="Hospital (optional)">
              <input
                className={inputCls}
                value={form.hospitalName ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, hospitalName: e.target.value || undefined }))
                }
                placeholder="General Hospital"
              />
            </Field>
          </div>

          <Field label="Date Prescribed">
            <input
              type="date"
              className={inputCls}
              value={form.prescribedDate}
              onChange={(e) => setForm((f) => ({ ...f, prescribedDate: e.target.value }))}
            />
          </Field>

          {/* Medication lines */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-700">Medications</p>
              <button
                onClick={addLine}
                className="flex items-center gap-1 text-xs font-medium text-teal-600 hover:underline"
              >
                <Plus size={14} /> Add drug
              </button>
            </div>
            <div className="space-y-3">
              {form.lines.map((line, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">Drug {idx + 1}</span>
                    {form.lines.length > 1 && (
                      <button onClick={() => removeLine(idx)} className="text-red-400 hover:text-red-600">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      className={inputCls}
                      placeholder="Drug name"
                      value={line.drugName}
                      onChange={(e) => updateLine(idx, { drugName: e.target.value })}
                    />
                    <input
                      className={inputCls}
                      placeholder="Dosage (e.g. 500mg BD)"
                      value={line.dosage}
                      onChange={(e) => updateLine(idx, { dosage: e.target.value })}
                    />
                    <input
                      type="number"
                      min={1}
                      className={inputCls}
                      placeholder="Qty"
                      value={line.quantity}
                      onChange={(e) => updateLine(idx, { quantity: Number(e.target.value) })}
                    />
                    <input
                      className={inputCls}
                      placeholder="Instructions (optional)"
                      value={line.instructions ?? ""}
                      onChange={(e) =>
                        updateLine(idx, { instructions: e.target.value || undefined })
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</div>
          )}
        </div>

        {/* footer */}
        <div className="border-t border-slate-100 px-6 py-4">
          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? "Saving…" : "Save Prescription"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Flag dialog ──────────────────────────────────────────────────────────────
function FlagDialog({
  rxId,
  onClose,
  onSuccess,
}: {
  rxId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [reason, setReason] = useState("");
  const flagMutation = useMutation({
    mutationFn: () => prescriptionService.flagRx(rxId, reason).then((r) => r.data),
    onSuccess: () => {
      onSuccess();
      onClose();
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <h3 className="font-bold text-slate-900">Flag Prescription</h3>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-slate-100">
            <X size={18} className="text-slate-500" />
          </button>
        </div>
        <div className="p-5 space-y-3">
          <p className="text-sm text-slate-500">Describe the issue with this prescription.</p>
          <textarea
            rows={3}
            className={`${inputCls} resize-none`}
            placeholder="Reason for flagging…"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>
        <div className="border-t border-slate-100 p-5 flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="danger"
            className="flex-1"
            disabled={!reason.trim() || flagMutation.isPending}
            onClick={() => flagMutation.mutate()}
          >
            {flagMutation.isPending ? "Flagging…" : "Flag"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Shared input class ───────────────────────────────────────────────────────
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

// ─── Main page ────────────────────────────────────────────────────────────────
export default function PrescriptionsPage() {
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<typeof STATUS_TABS[number]>("All");
  const [selected, setSelected] = useState<Prescription | null>(null);
  const [showNewPanel, setShowNewPanel] = useState(false);
  const [flagId, setFlagId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 350);

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.PRESCRIPTIONS, activeTab, debouncedSearch],
    queryFn: () =>
      prescriptionService
        .getPrescriptions({
          status: activeTab === "All" ? undefined : activeTab,
          q: debouncedSearch || undefined,
          pageSize: 50,
        })
        .then((r) => r.data),
  });

  const prescriptions = data?.items ?? [];

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: [QUERY_KEYS.PRESCRIPTIONS] });
    if (selected) {
      prescriptionService
        .getPrescriptionById(selected.id)
        .then((r) => setSelected(r.data))
        .catch(() => setSelected(null));
    }
  };

  const verifyMutation = useMutation({
    mutationFn: (id: string) => prescriptionService.verifyRx(id),
    onSuccess: invalidate,
  });

  const dispenseMutation = useMutation({
    mutationFn: (id: string) => prescriptionService.dispenseRx(id),
    onSuccess: invalidate,
  });

  return (
    <div className="flex h-[calc(100vh-5rem)] overflow-hidden">
      {/* ── Left: queue ── */}
      <div className="flex w-80 shrink-0 flex-col border-r border-slate-100 bg-white overflow-hidden">
        {/* Header + new button */}
        <div className="border-b border-slate-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="font-bold text-slate-900">Prescription Queue</h2>
              <p className="text-xs text-slate-500">{data?.total ?? 0} total</p>
            </div>
            <button
              onClick={() => setShowNewPanel(true)}
              className="flex items-center gap-1 rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-700 transition-colors"
            >
              <Plus size={14} /> New
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search prescriptions…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20"
            />
          </div>

          {/* Status tabs */}
          <div className="flex gap-1 overflow-x-auto pb-1">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold capitalize transition-colors whitespace-nowrap ${
                  activeTab === tab
                    ? "bg-teal-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {isLoading ? (
            <div className="p-5 text-center text-sm text-slate-400">Loading…</div>
          ) : prescriptions.length === 0 ? (
            <div className="p-5 text-center text-sm text-slate-400">
              {search ? "No prescriptions match your search." : "No prescriptions found."}
            </div>
          ) : (
            prescriptions.map((rx) => (
              <button
                key={rx.id}
                onClick={() => setSelected(rx)}
                className={`w-full p-4 text-left transition-colors hover:bg-slate-50 ${
                  selected?.id === rx.id ? "bg-teal-50 border-l-2 border-teal-600" : ""
                }`}
              >
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <span className="font-medium text-sm text-slate-900 truncate">
                    {rx.patientName}
                  </span>
                  <Badge variant={statusVariant(rx.status)} className="shrink-0">
                    {rx.status}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 truncate">{rx.doctorName}</p>
                <p className="mt-0.5 text-xs text-slate-400">
                  {rx.rxNumber} • {rx.lines.length} drug(s)
                </p>
              </button>
            ))
          )}
        </div>
      </div>

      {/* ── Right: detail ── */}
      <div className="flex-1 overflow-y-auto bg-slate-50 p-6">
        {!selected ? (
          <div className="flex h-full items-center justify-center text-center">
            <div>
              <FileText size={48} className="mx-auto mb-3 text-slate-300" />
              <p className="text-sm text-slate-400">Select a prescription to view details</p>
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-2xl space-y-5">
            {/* Title row */}
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Prescription Details</h1>
                <p className="mt-0.5 text-sm text-slate-500">ID: {selected.rxNumber}</p>
              </div>
              <Badge variant={statusVariant(selected.status)} className="text-sm px-3 py-1">
                {selected.status}
              </Badge>
            </div>

            {/* Info cards */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Patient Name", value: selected.patientName },
                { label: "Doctor", value: selected.doctorName },
                { label: "Hospital", value: selected.hospitalName ?? "—" },
                {
                  label: "Date Prescribed",
                  value: new Date(selected.prescribedDate).toLocaleDateString(),
                },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="mb-1 text-xs text-slate-500">{label}</p>
                  <p className="font-medium text-slate-900">{value}</p>
                </div>
              ))}
            </div>

            {/* Flag reason */}
            {selected.status === "Flagged" && selected.flagReason && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-500" />
                  <div>
                    <p className="text-sm font-semibold text-red-700">Flag Reason</p>
                    <p className="mt-0.5 text-sm text-red-600">{selected.flagReason}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Medications */}
            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
              <div className="border-b border-slate-100 px-5 py-3">
                <h3 className="font-semibold text-slate-900">Prescribed Medications</h3>
              </div>
              <div className="divide-y divide-slate-100">
                {selected.lines.map((line) => (
                  <div key={line.id} className="px-5 py-4">
                    <p className="font-medium text-slate-900">{line.drugName}</p>
                    <p className="mt-0.5 text-sm text-slate-500">
                      <span className="font-medium">Dosage:</span> {line.dosage}
                    </p>
                    {line.instructions && (
                      <p className="mt-0.5 text-sm text-slate-500">
                        <span className="font-medium">Instructions:</span> {line.instructions}
                      </p>
                    )}
                    <div className="mt-2">
                      <Badge variant="info">Qty: {line.quantity}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            {selected.status !== "Dispensed" && selected.status !== "Flagged" && (
              <div className="flex gap-3">
                {selected.status === "Pending" && (
                  <Button
                    className="flex-1"
                    disabled={verifyMutation.isPending}
                    onClick={() => verifyMutation.mutate(selected.id)}
                  >
                    <Check size={16} className="mr-2" />
                    {verifyMutation.isPending ? "Verifying…" : "Verify Prescription"}
                  </Button>
                )}
                {selected.status === "Verified" && (
                  <Button
                    variant="secondary"
                    className="flex-1"
                    disabled={dispenseMutation.isPending}
                    onClick={() => dispenseMutation.mutate(selected.id)}
                  >
                    <FileText size={16} className="mr-2" />
                    {dispenseMutation.isPending ? "Dispensing…" : "Dispense Medications"}
                  </Button>
                )}
                <Button
                  variant="danger"
                  onClick={() => setFlagId(selected.id)}
                >
                  <Flag size={16} className="mr-1" />
                  Flag
                </Button>
              </div>
            )}

            {(verifyMutation.isError || dispenseMutation.isError) && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
                {(verifyMutation.error as Error | null)?.message ??
                  (dispenseMutation.error as Error | null)?.message}
              </p>
            )}
          </div>
        )}
      </div>

      {/* New prescription panel */}
      {showNewPanel && (
        <NewPrescriptionPanel
          onClose={() => setShowNewPanel(false)}
          onSuccess={() => {
            qc.invalidateQueries({ queryKey: [QUERY_KEYS.PRESCRIPTIONS] });
          }}
        />
      )}

      {/* Flag dialog */}
      {flagId && (
        <FlagDialog
          rxId={flagId}
          onClose={() => setFlagId(null)}
          onSuccess={invalidate}
        />
      )}
    </div>
  );
}
