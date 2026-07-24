import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { User as UserIcon, Mail, Shield, Building2, KeyRound } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { authService } from "../../services/authService";
import { ROUTES } from "../../constants/routes";

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-4 px-4 py-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100">
        <Icon size={16} className="text-slate-500" />
      </div>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-sm font-medium text-slate-900">{value}</p>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const { data: user, isLoading } = useQuery({
    queryKey: ["me"],
    queryFn: () => authService.me().then((r) => r.data),
  });

  if (isLoading || !user) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-slate-400">
        Loading profile…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
        <p className="mt-0.5 text-sm text-slate-500">Your personal account details</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="flex items-center gap-4 border-b border-slate-100 bg-gradient-to-r from-teal-600/10 to-amber-500/10 px-6 py-5">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-600 to-amber-500 text-lg font-bold text-white">
            {user.firstName[0]}
            {user.lastName[0]}
          </div>
          <div>
            <p className="text-lg font-bold text-slate-900">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-sm text-slate-500 capitalize">{user.role}</p>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          <InfoRow icon={UserIcon} label="Username" value={user.username} />
          <InfoRow icon={Mail} label="Email" value={user.email || "—"} />
          <InfoRow icon={Shield} label="Role" value={user.role} />
          <InfoRow icon={Building2} label="Branch" value={user.branchId} />
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
          <p className="text-sm text-slate-600">Keep your account secure.</p>
          <Button onClick={() => navigate(ROUTES.CHANGE_PASSWORD)}>
            <KeyRound size={15} /> Change Password
          </Button>
        </div>
      </div>
    </div>
  );
}
