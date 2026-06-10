import api from "./api";

export interface BranchSettings {
  pharmacyName: string;
  branchName: string;
  address?: string;
  phone?: string;
  email?: string;
  nafdacNumber?: string;
  receiptHeader: string;
  receiptFooter: string;
  showLogo: boolean;
  showBarcode: boolean;
  vatRate: number;
  taxId?: string;
  applyVat: boolean;
  autoBackup: boolean;
  lastBackupAt?: string;
}

export interface StaffUser {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  username: string;
  role: string;
  isActive: boolean;
}

export const settingsService = {
  getSettings: () => api.get<BranchSettings>("/settings"),
  updateSettings: (data: BranchSettings) => api.put<BranchSettings>("/settings", data),
  getStaff: () => api.get<StaffUser[]>("/settings/staff"),
  toggleUser: (userId: string) => api.patch(`/settings/staff/${userId}/toggle`),
};
