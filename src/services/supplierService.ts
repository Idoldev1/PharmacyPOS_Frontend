import api from "./api";

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address?: string;
  isActive: boolean;
  createdAt: string;
}

export interface CreateSupplierRequest {
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address?: string;
}

export interface PurchaseOrderItem {
  id: string;
  drugId: string;
  drugName: string;
  brandName?: string;
  quantity: number;
  unitCost: number;
  subtotal: number;
}

export interface PurchaseOrder {
  id: string;
  supplierId: string;
  poNumber: string;
  orderDate: string;
  expectedDelivery?: string;
  status: "draft" | "sent" | "received";
  total: number;
  createdAt: string;
  items: PurchaseOrderItem[];
}

export interface CreatePurchaseOrderRequest {
  orderDate: string;
  expectedDelivery?: string;
  items: { drugId: string; drugName: string; brandName?: string; quantity: number; unitCost: number }[];
}

export const supplierService = {
  getSuppliers: () => api.get<Supplier[]>("/suppliers"),
  getById: (id: string) => api.get<Supplier>(`/suppliers/${id}`),
  createSupplier: (data: CreateSupplierRequest) => api.post<Supplier>("/suppliers", data),
  getOrders: (supplierId: string) => api.get<PurchaseOrder[]>(`/suppliers/${supplierId}/orders`),
  createOrder: (supplierId: string, data: CreatePurchaseOrderRequest) =>
    api.post<PurchaseOrder>(`/suppliers/${supplierId}/orders`, data),
  sendOrder: (orderId: string) =>
    api.post<{ success: boolean }>(`/suppliers/orders/${orderId}/send`),
};
