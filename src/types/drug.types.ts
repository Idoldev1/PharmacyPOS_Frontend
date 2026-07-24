export type StockStatus = "in_stock" | "low_stock" | "out_of_stock" | "near_expiry";

export interface Drug {
  id: string;
  name: string;
  genericName?: string;
  strength?: string;
  form: string;
  category: string;
  batchNo?: string;
  expiryDate?: string;
  stockQty: number;
  reservedQty: number;
  availableQty: number;
  reorderLevel: number;
  unitCost: number;
  sellingPrice: number;
  nafdacNo?: string;
  supplierId?: string;
  brandId: string;
  brandName: string;
  branchId: string;
  status: StockStatus;
  isActive: boolean;
  createdAt: string;
}

export interface DrugListResult {
  items: Drug[];
  total: number;
  page: number;
  pageSize: number;
  totalValue: number;
  totalWorth: number;
}
