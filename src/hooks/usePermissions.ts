import { useAuthStore } from "../store/authStore";

export function usePermissions() {
  const permissions = useAuthStore((s) => s.user?.permissions ?? []);
  const permSet = new Set(permissions);

  return {
    hasPermission: (perm: string) => permSet.has(perm),
    hasAnyPermission: (perms: string[]) => perms.some((p) => permSet.has(p)),
  };
}
