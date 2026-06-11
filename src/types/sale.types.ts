export type PaymentMethod = "cash" | "card" | "pos" | "transfer" | "hmo";

export interface CartItem {
  drugId: string;
  drugName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface SaleItem {
  drugId: string;
  drugName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Sale {
  id: string;
  receiptNo: string;
  patientId?: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: PaymentMethod;
  cashierId: string;
  status: string;
  createdAt: string;
}
