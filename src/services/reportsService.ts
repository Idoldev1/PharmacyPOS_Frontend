import api from "./api";

export interface ReportsSummary {
  todayRevenue: number;
  todayTransactions: number;
  avgSaleValue: number;
  lowStockCount: number;
  topSellingDrug: string;
  topSellingBrand?: string;
  topSellingUnits: number;
}

export interface WeeklyRevenuePoint {
  day: string;
  revenue: number;
}

export interface PaymentMethodPoint {
  name: string;
  value: number;
  color: string;
}

export interface TopDrugEntry {
  name: string;
  brand?: string;
  units: number;
  revenue: number;
}

export const reportsService = {
  getSummary: () => api.get<ReportsSummary>("/reports/summary"),
  getWeeklyRevenue: () => api.get<WeeklyRevenuePoint[]>("/reports/weekly-revenue"),
  getPaymentBreakdown: () => api.get<PaymentMethodPoint[]>("/reports/payment-breakdown"),
  getTopDrugs: () => api.get<TopDrugEntry[]>("/reports/top-drugs"),
};
