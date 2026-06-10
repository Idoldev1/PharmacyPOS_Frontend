import api from "./api";

export const reportService = {
  getSalesSummary: (from: string, to: string) =>
    api.get("/reports/sales", { params: { from, to } }),
  exportReport: (type: string, format: "pdf" | "csv") =>
    api.get(`/reports/${type}/export`, { params: { format }, responseType: "blob" }),
};
