export type PurchaseType =
  | "COMPLETED"
  | "REFUNDED"
  | "CANCELLED";

export interface PurchaseResponse {
  purchaseId: number;

  clientId: number;
  clientFirstName: string;
  clientLastName: string;

  serviceId: number;
  serviceTitle: string;

  amount: number;
  comment: string | null;

  type: PurchaseType;
  status: boolean;

  createdAt: string;
  updatedAt: string;
}

export interface CreatePurchaseRequest {
  clientId: number;
  serviceId: number;
  accountId: number;

  amount: number;
  validFrom: string;

  comment?: string | null;
}

export interface RefundPurchaseRequest {
  comment?: string | null;
}