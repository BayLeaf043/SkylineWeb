export interface CreateAdminRequest {
  firstName: string;
  lastName: string;
  phone: string;
  birthDate: string;
}

export interface CreateTrainerRequest {
  firstName: string;
  lastName: string;
  phone: string;
  birthDate: string;
  specialization: string;
  description: string;
  experienceYears: number;
}

export interface EmployeeResponse {
  userId: number;

  firstName: string;
  lastName: string;

  phone: string | null;
  birthDate: string | null;

  role: "ADMIN" | "TRAINER";
  status: boolean;

  trainerId: number | null;

  specialization: string | null;
  description: string | null;
  experienceYears: number | null;
}

export interface UpdateEmployeeRequest {
  firstName: string;
  lastName: string;
  phone: string;
  birthDate: string;

  specialization?: string | null;
  description?: string | null;
  experienceYears?: number | null;
}

export interface UpdateEmployeeStatusRequest {
  status: boolean;
}