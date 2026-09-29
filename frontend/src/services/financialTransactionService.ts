import { authService } from "./authService";

import type {
  FinancialTransactionResponse,
  CreateFinancialTransactionRequest,
  UpdateFinancialTransactionRequest,
} from "../types/financialTransaction";

const API_URL =
  "http://localhost:8080/api/financial-transactions";

const getHeaders = () => {
  const accessToken = authService.getAccessToken();

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
  };
};

export const financialTransactionService = {
  async getAll(): Promise<
    FinancialTransactionResponse[]
  > {
    const response = await fetch(API_URL, {
      method: "GET",
      headers: getHeaders(),
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => null);

      throw new Error(
        error?.message ||
          "Не вдалося завантажити список фінансових операцій"
      );
    }

    return response.json();
  },

  async getById(
    transactionId: number
  ): Promise<FinancialTransactionResponse> {
    const response = await fetch(
      `${API_URL}/${transactionId}`,
      {
        method: "GET",
        headers: getHeaders(),
      }
    );

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => null);

      throw new Error(
        error?.message ||
          "Не вдалося завантажити фінансову операцію"
      );
    }

    return response.json();
  },

  async createTransaction(
    data: CreateFinancialTransactionRequest
  ): Promise<FinancialTransactionResponse> {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => null);

      throw new Error(
        error?.message ||
          "Не вдалося створити фінансову операцію"
      );
    }

    return response.json();
  },

  async updateTransaction(
    transactionId: number,
    data: UpdateFinancialTransactionRequest
  ): Promise<FinancialTransactionResponse> {
    const response = await fetch(
      `${API_URL}/${transactionId}`,
      {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => null);

      throw new Error(
        error?.message ||
          "Не вдалося оновити фінансову операцію"
      );
    }

    return response.json();
  },

  async deleteTransaction(
    transactionId: number
  ): Promise<void> {
    const response = await fetch(
      `${API_URL}/${transactionId}`,
      {
        method: "DELETE",
        headers: getHeaders(),
      }
    );

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => null);

      throw new Error(
        error?.message ||
          "Не вдалося видалити фінансову операцію"
      );
    }
  },
};