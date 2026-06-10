export type Role = "pharmacist" | "cashier" | "manager" | "admin";

export interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  role: Role;
  branchId: string;
}

export interface AuthToken {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: User;
}
