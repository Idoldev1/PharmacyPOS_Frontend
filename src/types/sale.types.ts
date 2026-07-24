export type PaymentMethod = "cash" | "card" | "pos" | "transfer" | "hmo";

export interface CartItem {
  drugId: string;
  drugName: string;
  brandName?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface SaleItem {
  drugId: string;
  drugName: string;
  brandName?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Sale {
  id: string;
  receiptNo: string;
  patientId?: string;
  patientName?: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: PaymentMethod;
  cashierId: string;
  cashierFirstName?: string;
  status: string;
  createdAt: string;
}

export interface PendingSale {
  id: string;
  code: string;
  patientId?: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  status: string;
  createdAt: string;
  expiresAt: string;
}
