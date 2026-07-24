import api from "./api";
import type { Sale, PendingSale } from "../types/sale.types";

export interface SaleListResult {
  items: Sale[];
  total: number;
  page: number;
  pageSize: number;
}

export const salesService = {
  initiateSale: (
    items: { drugId: string; quantity: number }[],
    discount = 0,
    patientId?: string
  ) => api.post<PendingSale>("/sales/pending", { items, discount, patientId }),
  getPendingSales: () => api.get<PendingSale[]>("/sales/pending"),
  getPendingSaleByCode: (code: string) => api.get<PendingSale>(`/sales/pending/${code}`),
  completeSale: (code: string, paymentMethod: string) =>
    api.post<Sale>(`/sales/pending/${code}/complete`, { paymentMethod }),
  cancelPendingSale: (id: string) => api.post(`/sales/pending/${id}/cancel`),
  getSaleById: (id: string) => api.get<Sale>(`/sales/${id}`),
  refundSale: (id: string) => api.post(`/sales/${id}/refund`),
  getSales: (params?: object) => api.get<SaleListResult>("/sales", { params }),
};
