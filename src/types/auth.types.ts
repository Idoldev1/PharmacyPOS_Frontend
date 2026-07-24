export type Role = "Pharmacist" | "Cashier" | "Manager" | "Admin" | "ChiefPharmacist";

export interface User {
  id: string;
  username: string;
  email?: string;
  firstName: string;
  lastName: string;
  role: Role;
  branchId: string;
  permissions: string[];
}

export interface AuthToken {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: User;
}
