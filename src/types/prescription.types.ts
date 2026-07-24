export type PrescriptionStatus = "Pending" | "Verified" | "Dispensed" | "Flagged";

export interface PrescriptionLine {
  id: string;
  drugName: string;
  drugId?: string;
  dosage: string;
  quantity: number;
  instructions?: string;
}

export interface Prescription {
  id: string;
  rxNumber: string;
  patientName: string;
  patientId?: string;
  doctorName: string;
  doctorLicense?: string;
  hospitalName?: string;
  prescribedDate: string;
  status: PrescriptionStatus;
  flagReason?: string;
  verifiedBy?: string;
  dispensedBy?: string;
  verifiedAt?: string;
  dispensedAt?: string;
  branchId?: string;
  createdAt: string;
  lines: PrescriptionLine[];
}

export interface CreatePrescriptionLineRequest {
  drugName: string;
  drugId?: string;
  dosage: string;
  quantity: number;
  instructions?: string;
}

export interface CreatePrescriptionRequest {
  patientName: string;
  patientId?: string;
  doctorName: string;
  doctorLicense?: string;
  hospitalName?: string;
  prescribedDate: string;
  lines: CreatePrescriptionLineRequest[];
}
