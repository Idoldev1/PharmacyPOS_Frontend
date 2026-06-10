import api from "./api";
import type { Sale } from "../types/sale.types";

export interface SaleListResult {
  items: Sale[];
  total: number;
  page: number;
  pageSize: number;
}

export const salesService = {
  createSale: (
    items: { drugId: string; quantity: number }[],
    paymentMethod: string,
    discount = 0,
    patientId?: string
  ) => api.post<Sale>("/sales", { items, paymentMethod, discount, patientId }),
  getSaleById: (id: string) => api.get<Sale>(`/sales/${id}`),
  refundSale: (id: string) => api.post(`/sales/${id}/refund`),
  getSales: (params?: object) => api.get<SaleListResult>("/sales", { params }),
};
