import api from "./api";
import type { AuthToken, User } from "../types/auth.types";

export const authService = {
  login: (username: string, password: string, role: string) =>
    api.post<AuthToken>("/auth/login", { username, password, role }),
  signup: (payload: { username: string; password: string; firstName: string; lastName: string; role: string; branchId: string }) =>
    api.post<AuthToken>("/auth/signup", payload),
  logout: (refreshToken: string | null) =>
    api.post("/auth/logout", { token: refreshToken }),
  refreshToken: (token: string) =>
    api.post<AuthToken>("/auth/refresh", { token }),
  requestPasswordReset: (username: string) =>
    api.post<{ resetToken: string; message: string }>("/auth/request-reset", { username }),
  resetPassword: (token: string, newPassword: string) =>
    api.post("/auth/reset-password", { token, newPassword }),
  changePassword: (currentPassword: string, newPassword: string) =>
    api.post("/auth/change-password", { currentPassword, newPassword }),
  me: () => api.get<User>("/auth/me"),
};
