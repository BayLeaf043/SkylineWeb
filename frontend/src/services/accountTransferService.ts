import { authService } from "./authService";

import type {
  AccountTransferResponse,
  CreateAccountTransferRequest,
} from "../types/accountTransfer";

const API_URL =
  "http://localhost:8080/api/account-transfers";

const getHeaders = () => {
  const accessToken = authService.getAccessToken();

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
  };
};

export const accountTransferService = {
  async getAll(): Promise<AccountTransferResponse[]> {
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
          "Не вдалося завантажити список переказів"
      );
    }

    return response.json();
  },

  async getById(
    transferId: number
  ): Promise<AccountTransferResponse> {
    const response = await fetch(
      `${API_URL}/${transferId}`,
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
          "Не вдалося завантажити дані переказу"
      );
    }

    return response.json();
  },

  async createTransfer(
    data: CreateAccountTransferRequest
  ): Promise<AccountTransferResponse> {
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
          "Не вдалося виконати переказ"
      );
    }

    return response.json();
  },
};