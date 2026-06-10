import { useAuthStore } from "../store/authStore";

export function usePermission(_action: string, _resource = "*"): boolean {
  const user = useAuthStore((s) => s.user);
  if (!user) return false;
  return user.role.toLowerCase() === "admin";
}
