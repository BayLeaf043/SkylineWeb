export type CertificateType =
  | "ACTIVE"
  | "USED"
  | "EXPIRED"
  | "CANCELLED";

export interface CertificateResponse {
  certificateId: number;
  purchaseId: number;

  clientId: number;
  clientFirstName: string;
  clientLastName: string;

  serviceId: number;
  serviceTitle: string;

  validFrom: string;
  validTo: string;

  totalSessions: number;
  usedSessions: number;
  remainingSessions: number;

  type: CertificateType;
  status: boolean;

  createdAt: string;
  updatedAt: string;
}

export interface UpdateCertificateValidityRequest {
  validTo: string;
}