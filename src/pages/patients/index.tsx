import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, UserPlus, AlertCircle, User, X, Plus } from "lucide-react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { patientService } from "../../services/patientService";
import { QUERY_KEYS } from "../../constants/queryKeys";
import { useDebounce } from "../../hooks/useDebounce";
import { usePermissions } from "../../hooks/usePermissions";
import { Permissions } from "../../constants/permissions";
import type { Patient, CreatePatientRequest } from "../../types/patient.types";
import type { Sale } from "../../types/sale.types";

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

// ─── Add Patient slide-in panel ───────────────────────────────────────────────
function AddPatientPanel({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState<CreatePatientRequest>({
    firstName: "",
    lastName: "",
    phone: "",
    dateOfBirth: "",
    gender: "Male",
    allergies: [],
  });
  const [allergyInput, setAllergyInput] = useState("");
  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: (payload: CreatePatientRequest) =>
      patientService.createPatient(payload).then((r) => r.data),
    onSuccess: () => { onSuccess(); onClose(); },
    onError: (e: Error) => setError(e.message),
  });

  const addAllergy = () => {
    const trimmed = allergyInput.trim();
    if (trimmed && !form.allergies.includes(trimmed)) {
      setForm((f) => ({ ...f, allergies: [...f.allergies, trimmed] }));
    }
    setAllergyInput("");
  };

  const removeAllergy = (a: string) =>
    setForm((f) => ({ ...f, allergies: f.allergies.filter((x) => x !== a) }));

  const handleSubmit = () => {
    if (!form.firstName.trim()) return setError("First name is required.");
    if (!form.lastName.trim()) return setError("Last name is required.");
    if (!form.phone.trim()) return setError("Phone number is required.");
    if (!form.dateOfBirth) return setError("Date of birth is required.");
    setError("");
    mutation.mutate(form);
  };

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <div className="flex w-full max-w-md flex-col bg-white shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="font-bold text-slate-900">New Patient</h2>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-slate-100">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="First Name *">
              <input className={inputCls} value={form.firstName}
                onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                placeholder="Adebayo" />
            </Field>
            <Field label="Last Name *">
              <input className={inputCls} value={form.lastName}
                onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                placeholder="Oluwaseun" />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Phone *">
              <input className={inputCls} value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="08012345678" />
            </Field>
            <Field label="Email">
              <input className={inputCls} value={form.email ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value || undefined }))}
                placeholder="patient@email.com" />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Date of Birth *">
              <input type="date" className={inputCls} value={form.dateOfBirth}
                onChange={(e) => setForm((f) => ({ ...f, dateOfBirth: e.target.value }))} />
            </Field>
            <Field label="Gender">
              <select className={inputCls} value={form.gender}
                onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))}>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </Field>
          </div>

          <Field label="Address">
            <input className={inputCls} value={form.address ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, address: e.target.value || undefined }))}
              placeholder="123 Lagos Street" />
          </Field>

          <Field label="NHIS Number">
            <input className={inputCls} value={form.nhisNumber ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, nhisNumber: e.target.value || undefined }))}
              placeholder="NHIS-12345" />
          </Field>

          {/* Allergies */}
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Known Allergies</label>
            <div className="flex gap-2 mb-2">
              <input className={inputCls} value={allergyInput}
                onChange={(e) => setAllergyInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addAllergy()}
                placeholder="e.g. Penicillin" />
              <button onClick={addAllergy}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-600 text-white hover:bg-teal-700">
                <Plus size={16} />
              </button>
            </div>
            {form.allergies.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {form.allergies.map((a) => (
                  <span key={a} className="flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700">
                    {a}
                    <button onClick={() => removeAllergy(a)} className="hover:text-red-900">
                      <X size={11} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>}
        </div>

        <div className="border-t border-slate-100 px-6 py-4">
          <Button className="w-full" onClick={handleSubmit} disabled={mutation.isPending}>
            {mutation.isPending ? "Saving…" : "Save Patient"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Purchase history table ───────────────────────────────────────────────────
function PurchaseHistory({ patientId }: { patientId: string }) {
  const { data: history, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.PATIENTS, patientId, "history"],
    queryFn: () => patientService.getPatientHistory(patientId).then((r) => r.data),
    enabled: !!patientId,
  });

  if (isLoading) return <div className="p-5 text-sm text-slate-400">Loading history…</div>;
  const sales: Sale[] = history ?? [];

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      <div className="border-b border-slate-100 px-5 py-3">
        <h3 className="font-semibold text-slate-900">Purchase History</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              {["Date", "Receipt ID", "Items", "Total", "Payment", "Status"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sales.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                  No purchase history
                </td>
              </tr>
            ) : (
              sales.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-600">
                    {new Date(s.createdAt).toLocaleDateString("en-NG")}
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-700">{s.receiptNo}</td>
                  <td className="px-4 py-3 text-slate-600">{s.items.length}</td>
                  <td className="px-4 py-3 font-medium text-slate-900">
                    ₦{Number(s.total).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 capitalize text-slate-600">{s.paymentMethod}</td>
                  <td className="px-4 py-3">
                    <Badge variant={s.status === "Completed" ? "success" : s.status === "Refunded" ? "danger" : "warning"}>
                      {s.status}
                    </Badge>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function PatientsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Patient | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const debouncedSearch = useDebounce(search, 350);
  const { hasPermission } = usePermissions();
  const canAddPatient = hasPermission(Permissions.Patients.Create);

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.PATIENTS, debouncedSearch],
    queryFn: () =>
      patientService.getPatients({ q: debouncedSearch || undefined, pageSize: 50 }).then((r) => r.data),
  });

  const patients = data?.items ?? [];

  const age = (dob: string) =>
    new Date().getFullYear() - new Date(dob).getFullYear();

  return (
    <div className="flex h-[calc(100vh-5rem)] overflow-hidden">
      {/* ── Left sidebar ── */}
      <div className="flex w-80 shrink-0 flex-col border-r border-slate-100 bg-white overflow-hidden">
        <div className="border-b border-slate-100 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold text-slate-900">Patients</h2>
            {canAddPatient && (
              <Button size="sm" onClick={() => setShowAdd(true)}>
                <UserPlus size={15} /> Add
              </Button>
            )}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search patients…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {isLoading ? (
            <div className="p-5 text-center text-sm text-slate-400">Loading…</div>
          ) : patients.length === 0 ? (
            <div className="p-5 text-center text-sm text-slate-400">
              {search ? "No patients match your search." : "No patients registered."}
            </div>
          ) : (
            patients.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelected(p)}
                className={`w-full p-4 text-left transition-colors hover:bg-slate-50 ${
                  selected?.id === p.id ? "bg-teal-50 border-l-2 border-teal-600" : ""
                }`}
              >
                <div className="font-medium text-sm text-slate-900">{p.fullName}</div>
                <div className="mt-0.5 text-xs text-slate-500">{p.phone}</div>
                {p.allergies.length > 0 && (
                  <div className="mt-1.5 flex items-center gap-1 text-xs text-red-600">
                    <AlertCircle size={11} />
                    {p.allergies.length} known allergy(ies)
                  </div>
                )}
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
              <User size={48} className="mx-auto mb-3 text-slate-300" />
              <p className="text-sm text-slate-400">Select a patient to view their profile</p>
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-2xl space-y-5">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Patient Profile</h1>
              <p className="mt-0.5 text-sm text-slate-500">ID: PAT-{selected.id.slice(0, 8).toUpperCase()}</p>
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Full Name", value: selected.fullName },
                { label: "Phone Number", value: selected.phone },
                { label: "Gender", value: selected.gender },
                {
                  label: "Date of Birth",
                  value: new Date(selected.dateOfBirth).toLocaleDateString("en-NG", {
                    year: "numeric", month: "long", day: "numeric",
                  }),
                },
                { label: "Age", value: `${age(selected.dateOfBirth)} years` },
                { label: "NHIS Number", value: selected.nhisNumber ?? "—" },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="mb-1 text-xs text-slate-500">{label}</p>
                  <p className="font-medium text-slate-900">{value}</p>
                </div>
              ))}
            </div>

            {/* Allergies */}
            {selected.allergies.length > 0 ? (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-500" />
                  <div>
                    <p className="mb-2 font-semibold text-red-700">Known Allergies</p>
                    <div className="flex flex-wrap gap-2">
                      {selected.allergies.map((a) => (
                        <Badge key={a} variant="danger">{a}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                <p className="text-sm text-emerald-700">No known allergies</p>
              </div>
            )}

            {/* Purchase history */}
            <PurchaseHistory patientId={selected.id} />
          </div>
        )}
      </div>

      {showAdd && (
        <AddPatientPanel
          onClose={() => setShowAdd(false)}
          onSuccess={() => qc.invalidateQueries({ queryKey: [QUERY_KEYS.PATIENTS] })}
        />
      )}
    </div>
  );
}
