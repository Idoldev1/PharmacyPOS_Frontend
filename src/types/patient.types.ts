export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone: string;
  email?: string;
  dateOfBirth: string;
  gender: string;
  address?: string;
  allergies: string[];
  nhisNumber?: string;
  branchId: string;
  createdAt: string;
}

export interface CreatePatientRequest {
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  dateOfBirth: string;
  gender: string;
  address?: string;
  allergies: string[];
  nhisNumber?: string;
}

export interface PatientListResult {
  items: Patient[];
  total: number;
  page: number;
  pageSize: number;
}
