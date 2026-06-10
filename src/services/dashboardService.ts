import api from "./api";
import type { Drug } from "../types/drug.types";

export interface DashboardSummary {
  todayRevenue: number;
  todayTransactions: number;
  lowStockCount: number;
  pendingRxCount: number;
  lowStockDrugs: Drug[];
}

export const dashboardService = {
  getSummary: () => api.get<DashboardSummary>("/dashboard/summary"),
};
