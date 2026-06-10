export const formatNaira = (amount: number): string =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(amount);

export const parseNaira = (value: string): number =>
  parseFloat(value.replace(/[₦,]/g, "")) || 0;
