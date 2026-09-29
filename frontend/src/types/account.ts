export type AccountType =
  | "CASH"
  | "BANK"
  | "OTHER";

export interface AccountResponse {
  accountId: number;
  title: string;
  type: AccountType;
  balance: number;
  status: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAccountRequest {
  title: string;
  type: AccountType;
  openingBalance: number;
}

export interface UpdateAccountRequest {
  title: string;
  type: AccountType;
}

export interface UpdateAccountStatusRequest {
  status: boolean;
}