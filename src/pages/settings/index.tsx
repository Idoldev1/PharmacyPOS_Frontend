import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Building, Users, Receipt, Printer, Database, KeyRound, UserPlus, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import {
  settingsService,
  type BranchSettings,
  type StaffUser,
  type CreateStaffPayload,
} from "../../services/settingsService";
import { ROUTES } from "../../constants/routes";
import { usePermissions } from "../../hooks/usePermissions";
import { Permissions } from "../../constants/permissions";

const inputCls =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30";

const STAFF_ROLES = [
  { value: "Pharmacist", label: "Pharmacist" },
  { value: "Cashier", label: "Cashier" },
  { value: "Manager", label: "Manager" },
  { value: "Admin", label: "Admin" },
  { value: "ChiefPharmacist", label: "Chief Pharmacist" },
] as const;

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-slate-600">{label}</label>
      {children}
    </div>
  );
}

function SectionCard({
  icon: Icon,
  iconBg,
  iconColor,
  title,
  subtitle,
  children,
}: {
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-4">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconBg}`}>
          <Icon size={20} className={iconColor} />
        </div>
        <div>
          <h3 className="font-semibold text-slate-900">{title}</h3>
          <p className="text-sm text-slate-500">{subtitle}</p>
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

// ─── Pharmacy Profile section ─────────────────────────────────────────────────
function PharmacyProfileSection({ settings }: { settings: BranchSettings }) {
  const qc = useQueryClient();
  const [form, setForm] = useState<BranchSettings>(settings);
  const [saved, setSaved] = useState(false);

  useEffect(() => { setForm(settings); }, [settings]);

  const mutation = useMutation({
    mutationFn: (data: BranchSettings) => settingsService.updateSettings(data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["settings"] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    },
  });

  return (
    <SectionCard icon={Building} iconBg="bg-teal-50" iconColor="text-teal-600"
      title="Pharmacy Profile" subtitle="Basic pharmacy information">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Pharmacy Name</label>
            <input className={inputCls} value={form.pharmacyName}
              onChange={(e) => setForm((f) => ({ ...f, pharmacyName: e.target.value }))} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Branch Name</label>
            <input className={inputCls} value={form.branchName}
              onChange={(e) => setForm((f) => ({ ...f, branchName: e.target.value }))} />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Address</label>
          <input className={inputCls} value={form.address ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, address: e.target.value || undefined }))} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Phone Number</label>
            <input className={inputCls} value={form.phone ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value || undefined }))} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Email</label>
            <input className={inputCls} value={form.email ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value || undefined }))} />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">NAFDAC Registration Number</label>
          <input className={inputCls} value={form.nafdacNumber ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, nafdacNumber: e.target.value || undefined }))} />
        </div>
        <Button onClick={() => mutation.mutate(form)} disabled={mutation.isPending}>
          {saved ? "Saved!" : mutation.isPending ? "Saving…" : "Save Changes"}
        </Button>
      </div>
    </SectionCard>
  );
}

// ─── Onboard staff slide-in panel ──────────────────────────────────────────────
function AddStaffPanel({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState<CreateStaffPayload>({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    role: "Pharmacist",
  });
  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: (payload: CreateStaffPayload) =>
      settingsService.createStaff(payload).then((r) => r.data),
    onSuccess: () => { onSuccess(); onClose(); },
    onError: (e: Error) => setError(e.message),
  });

  const handleSubmit = () => {
    if (!form.firstName.trim()) return setError("First name is required.");
    if (!form.lastName.trim()) return setError("Last name is required.");
    if (!form.username.trim()) return setError("Username is required.");
    if (!form.email.trim()) return setError("Email is required.");
    if (form.password.length < 6) return setError("Password must be at least 6 characters.");
    setError("");
    mutation.mutate(form);
  };

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <div className="flex w-full max-w-md flex-col bg-white shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="font-bold text-slate-900">Onboard Staff</h2>
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

          <Field label="Username *">
            <input className={inputCls} value={form.username}
              onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
              placeholder="adebayo.o" />
          </Field>

          <Field label="Email *">
            <input type="email" className={inputCls} value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="adebayo@pharmacy.com" />
          </Field>

          <Field label="Temporary Password *">
            <input type="password" className={inputCls} value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              placeholder="At least 6 characters" />
          </Field>

          <Field label="Role">
            <select className={inputCls} value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}>
              {STAFF_ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </Field>

          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>}
        </div>

        <div className="border-t border-slate-100 px-6 py-4">
          <Button className="w-full" onClick={handleSubmit} disabled={mutation.isPending}>
            {mutation.isPending ? "Creating…" : "Create Account"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Reset staff password modal ────────────────────────────────────────────────
function ResetPasswordModal({ user, onClose, onSuccess }: { user: StaffUser; onClose: () => void; onSuccess: () => void }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: () => settingsService.resetStaffPassword(user.id, newPassword),
    onSuccess: () => { onSuccess(); onClose(); },
    onError: (e: Error) => setError(e.message),
  });

  const handleSubmit = () => {
    if (newPassword.length < 6) return setError("Password must be at least 6 characters.");
    if (newPassword !== confirmPassword) return setError("Passwords do not match.");
    setError("");
    mutation.mutate();
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="font-bold text-slate-900">Reset Password</h2>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-slate-100">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        <div className="space-y-4 px-6 py-5">
          <p className="text-sm text-slate-500">
            Set a new password for <span className="font-medium text-slate-700">{user.fullName}</span> ({user.username}).
          </p>
          <Field label="New Password *">
            <input type="password" className={inputCls} value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 6 characters" />
          </Field>
          <Field label="Confirm Password *">
            <input type="password" className={inputCls} value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password" />
          </Field>
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>}
        </div>

        <div className="border-t border-slate-100 px-6 py-4">
          <Button className="w-full" onClick={handleSubmit} disabled={mutation.isPending}>
            {mutation.isPending ? "Saving…" : "Set New Password"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── User Management section ─────────────────────────────────────────────────
function UserManagementSection() {
  const qc = useQueryClient();
  const { hasPermission } = usePermissions();
  const canManageUsers = hasPermission(Permissions.Settings.ManageUsers);
  const [showAdd, setShowAdd] = useState(false);
  const [resetTarget, setResetTarget] = useState<StaffUser | null>(null);

  const { data: staff = [], isLoading } = useQuery({
    queryKey: ["settings-staff"],
    queryFn: () => settingsService.getStaff().then((r) => r.data),
    enabled: canManageUsers,
  });

  const toggleMutation = useMutation({
    mutationFn: (userId: string) => settingsService.toggleUser(userId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["settings-staff"] }),
  });

  if (!canManageUsers) return null;

  return (
    <SectionCard icon={Users} iconBg="bg-blue-50" iconColor="text-blue-600"
      title="User Management" subtitle="Manage staff accounts and roles">
      <div className="mb-4 flex justify-end">
        <Button size="sm" onClick={() => setShowAdd(true)}>
          <UserPlus size={15} /> Onboard Staff
        </Button>
      </div>

      {isLoading ? (
        <div className="text-sm text-slate-400">Loading staff…</div>
      ) : staff.length === 0 ? (
        <div className="text-sm text-slate-400">No staff accounts found.</div>
      ) : (
        <div className="space-y-3">
          {staff.map((user: StaffUser) => (
            <div key={user.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
              <div>
                <div className="font-medium text-slate-900">{user.fullName}</div>
                <div className="text-sm text-slate-500 capitalize">{user.role} · {user.username}</div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={user.isActive ? "success" : "warning"}>
                  {user.isActive ? "Active" : "Inactive"}
                </Badge>
                <Button size="sm" variant="secondary" onClick={() => setResetTarget(user)}>
                  Reset Password
                </Button>
                <Button size="sm" variant="secondary"
                  onClick={() => toggleMutation.mutate(user.id)}
                  disabled={toggleMutation.isPending}>
                  {user.isActive ? "Deactivate" : "Activate"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <AddStaffPanel
          onClose={() => setShowAdd(false)}
          onSuccess={() => qc.invalidateQueries({ queryKey: ["settings-staff"] })}
        />
      )}
      {resetTarget && (
        <ResetPasswordModal
          user={resetTarget}
          onClose={() => setResetTarget(null)}
          onSuccess={() => {}}
        />
      )}
    </SectionCard>
  );
}

// ─── Receipt Customization section ───────────────────────────────────────────
function ReceiptSection({ settings }: { settings: BranchSettings }) {
  const qc = useQueryClient();
  const [form, setForm] = useState(settings);
  const [saved, setSaved] = useState(false);
  useEffect(() => { setForm(settings); }, [settings]);

  const mutation = useMutation({
    mutationFn: (data: BranchSettings) => settingsService.updateSettings(data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["settings"] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    },
  });

  return (
    <SectionCard icon={Receipt} iconBg="bg-amber-50" iconColor="text-amber-600"
      title="Receipt Customization" subtitle="Configure receipt layout and information">
      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Receipt Header</label>
          <input className={inputCls} value={form.receiptHeader}
            onChange={(e) => setForm((f) => ({ ...f, receiptHeader: e.target.value }))} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Receipt Footer</label>
          <input className={inputCls} value={form.receiptFooter}
            onChange={(e) => setForm((f) => ({ ...f, receiptFooter: e.target.value }))} />
        </div>
        <div className="space-y-2">
          {[
            { field: "showLogo" as const, label: "Show pharmacy logo on receipt" },
            { field: "showBarcode" as const, label: "Include barcode on receipt" },
          ].map(({ field, label }) => (
            <label key={field} className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form[field] as boolean}
                onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.checked }))}
                className="rounded border-slate-300 text-teal-600" />
              <span className="text-sm text-slate-700">{label}</span>
            </label>
          ))}
        </div>
        <Button onClick={() => mutation.mutate(form)} disabled={mutation.isPending}>
          {saved ? "Saved!" : mutation.isPending ? "Saving…" : "Save Changes"}
        </Button>
      </div>
    </SectionCard>
  );
}

// ─── Tax & VAT section ────────────────────────────────────────────────────────
function TaxSection({ settings }: { settings: BranchSettings }) {
  const qc = useQueryClient();
  const [form, setForm] = useState(settings);
  const [saved, setSaved] = useState(false);
  useEffect(() => { setForm(settings); }, [settings]);

  const mutation = useMutation({
    mutationFn: (data: BranchSettings) => settingsService.updateSettings(data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["settings"] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    },
  });

  return (
    <SectionCard icon={Printer} iconBg="bg-emerald-50" iconColor="text-emerald-600"
      title="Tax & VAT Configuration" subtitle="Set tax rates and compliance settings">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">VAT Rate (%)</label>
            <input type="number" min="0" step="0.1" className={inputCls} value={form.vatRate}
              onChange={(e) => setForm((f) => ({ ...f, vatRate: parseFloat(e.target.value) || 0 }))} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Tax ID Number</label>
            <input className={inputCls} value={form.taxId ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, taxId: e.target.value || undefined }))} />
          </div>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.applyVat}
            onChange={(e) => setForm((f) => ({ ...f, applyVat: e.target.checked }))}
            className="rounded border-slate-300 text-teal-600" />
          <span className="text-sm text-slate-700">Apply VAT to all sales</span>
        </label>
        <Button onClick={() => mutation.mutate(form)} disabled={mutation.isPending}>
          {saved ? "Saved!" : mutation.isPending ? "Saving…" : "Save Changes"}
        </Button>
      </div>
    </SectionCard>
  );
}

// ─── Backup section ───────────────────────────────────────────────────────────
function BackupSection({ settings }: { settings: BranchSettings }) {
  const qc = useQueryClient();
  const [form, setForm] = useState(settings);
  useEffect(() => { setForm(settings); }, [settings]);

  const mutation = useMutation({
    mutationFn: (data: BranchSettings) => settingsService.updateSettings(data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["settings"] }),
  });

  return (
    <SectionCard icon={Database} iconBg="bg-amber-50" iconColor="text-amber-600"
      title="Backup & Sync" subtitle="Manage data backup and synchronization">
      <div className="space-y-4">
        <div className="flex items-center justify-between rounded-lg bg-slate-50 p-4">
          <div>
            <div className="font-medium text-slate-900">Last Backup</div>
            <div className="text-sm text-slate-500">
              {settings.lastBackupAt
                ? new Date(settings.lastBackupAt).toLocaleString("en-NG")
                : "Never"}
            </div>
          </div>
          <Button variant="secondary" size="sm">Backup Now</Button>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.autoBackup}
            onChange={(e) => {
              const updated = { ...form, autoBackup: e.target.checked };
              setForm(updated);
              mutation.mutate(updated);
            }}
            className="rounded border-slate-300 text-teal-600" />
          <span className="text-sm text-slate-700">Enable automatic daily backups</span>
        </label>
      </div>
    </SectionCard>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const navigate = useNavigate();

  const { data: settings, isLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: () => settingsService.getSettings().then((r) => r.data),
  });

  if (isLoading || !settings) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-slate-400">
        Loading settings…
      </div>
    );
  }

  return (
    <div className="overflow-y-auto bg-slate-50 p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="mt-0.5 text-sm text-slate-500">Manage system configuration and preferences</p>
      </div>

      <PharmacyProfileSection settings={settings} />
      <UserManagementSection />
      <ReceiptSection settings={settings} />
      <TaxSection settings={settings} />
      <BackupSection settings={settings} />

      {/* Security */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50">
            <KeyRound size={20} className="text-red-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Security</h3>
            <p className="text-sm text-slate-500">Update your password and manage account security</p>
          </div>
        </div>
        <div className="flex items-center justify-between p-6">
          <p className="text-sm text-slate-600">
            Keep your account secure by regularly changing your password.
          </p>
          <Button onClick={() => navigate(ROUTES.CHANGE_PASSWORD)}>
            Change Password
          </Button>
        </div>
      </div>
    </div>
  );
}
