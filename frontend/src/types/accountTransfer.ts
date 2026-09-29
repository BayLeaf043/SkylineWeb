export interface AccountTransferResponse {
  transferId: number;

  fromAccountId: number;
  fromAccountTitle: string;

  toAccountId: number;
  toAccountTitle: string;

  amount: number;
  comment: string | null;

  status: boolean;

  createdAt: string;
  updatedAt: string;
}

export interface CreateAccountTransferRequest {
  fromAccountId: number;
  toAccountId: number;
  amount: number;
  comment?: string | null;
}