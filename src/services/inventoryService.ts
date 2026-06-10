import api from "./api";
import type { Drug, DrugListResult } from "../types/drug.types";

export interface CreateDrugPayload {
  name: string;
  genericName?: string;
  strength?: string;
  form: string;
  category: string;
  batchNo?: string;
  expiryDate?: string;
  stockQty: number;
  reorderLevel: number;
  unitCost: number;
  sellingPrice: number;
  nafdacNo?: string;
}

export const inventoryService = {
  getDrugs: (params?: object) => api.get<DrugListResult>("/drugs", { params }),
  getDrugById: (id: string) => api.get<Drug>(`/drugs/${id}`),
  addDrug: (data: CreateDrugPayload) => api.post<Drug>("/drugs", data),
  updateStock: (id: string, quantity: number) =>
    api.patch(`/drugs/${id}/stock`, { quantity }),
  deleteDrug: (id: string) => api.delete(`/drugs/${id}`),
  getLowStockAlerts: () => api.get<Drug[]>("/drugs/low-stock"),
};
