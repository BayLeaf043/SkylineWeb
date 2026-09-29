export type FinancialTransactionType =
  | "INCOME"
  | "EXPENSE"
  | "REFUND"
  | "TRANSFER_IN"
  | "TRANSFER_OUT"
  | "OPENING_BALANCE";

export type ManualFinancialTransactionType =
  | "INCOME"
  | "EXPENSE";

export interface FinancialTransactionResponse {
  transactionId: number;

  accountId: number;
  accountTitle: string;

  purchaseId: number | null;
  transferId: number | null;

  type: FinancialTransactionType;
  amount: number;
  comment: string | null;

  status: boolean;

  createdAt: string;
  updatedAt: string;
}

export interface CreateFinancialTransactionRequest {
  accountId: number;
  type: ManualFinancialTransactionType;
  amount: number;
  comment?: string | null;
}

export interface UpdateFinancialTransactionRequest {
  accountId: number;
  type: ManualFinancialTransactionType;
  amount: number;
  comment?: string | null;
}