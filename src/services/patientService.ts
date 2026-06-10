import api from "./api";
import type { Patient, CreatePatientRequest, PatientListResult } from "../types/patient.types";
import type { Sale } from "../types/sale.types";

export const patientService = {
  getPatients: (params?: object) => api.get<PatientListResult>("/patients", { params }),
  getPatientById: (id: string) => api.get<Patient>(`/patients/${id}`),
  createPatient: (data: CreatePatientRequest) => api.post<Patient>("/patients", data),
  getPatientHistory: (id: string) => api.get<Sale[]>(`/patients/${id}/history`),
};
