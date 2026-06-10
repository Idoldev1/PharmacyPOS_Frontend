import api from "./api";
import type { Prescription, CreatePrescriptionRequest } from "../types/prescription.types";

export const prescriptionService = {
  getPrescriptions: (params?: object) =>
    api.get<{ items: Prescription[]; total: number }>("/prescriptions", { params }),
  getPrescriptionById: (id: string) => api.get<Prescription>(`/prescriptions/${id}`),
  createPrescription: (payload: CreatePrescriptionRequest) =>
    api.post<Prescription>("/prescriptions", payload),
  verifyRx: (id: string) => api.post<{ success: boolean }>(`/prescriptions/${id}/verify`),
  dispenseRx: (id: string) => api.post<{ success: boolean }>(`/prescriptions/${id}/dispense`),
  flagRx: (id: string, reason: string) =>
    api.post<{ success: boolean }>(`/prescriptions/${id}/flag`, { reason }),
};
