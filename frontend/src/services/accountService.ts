import { authService } from "./authService";

import type {
  AccountResponse,
  CreateAccountRequest,
  UpdateAccountRequest,
  UpdateAccountStatusRequest,
} from "../types/account";

const API_URL = "http://localhost:8080/api/accounts";

const getHeaders = () => {
  const accessToken = authService.getAccessToken();

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
  };
};

export const accountService = {
  async getAll(): Promise<AccountResponse[]> {
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
          "Не вдалося завантажити список рахунків"
      );
    }

    return response.json();
  },

  async getById(
    accountId: number
  ): Promise<AccountResponse> {
    const response = await fetch(
      `${API_URL}/${accountId}`,
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
          "Не вдалося завантажити дані рахунку"
      );
    }

    return response.json();
  },

  async createAccount(
    data: CreateAccountRequest
  ): Promise<AccountResponse> {
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
          "Не вдалося створити рахунок"
      );
    }

    return response.json();
  },

  async updateAccount(
    accountId: number,
    data: UpdateAccountRequest
  ): Promise<AccountResponse> {
    const response = await fetch(
      `${API_URL}/${accountId}`,
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
          "Не вдалося оновити рахунок"
      );
    }

    return response.json();
  },

  async updateAccountStatus(
    accountId: number,
    data: UpdateAccountStatusRequest
  ): Promise<AccountResponse> {
    const response = await fetch(
      `${API_URL}/${accountId}/status`,
      {
        method: "PATCH",
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
          "Не вдалося змінити статус рахунку"
      );
    }

    return response.json();
  },

  async deleteAccount(
    accountId: number
  ): Promise<void> {
    const response = await fetch(
      `${API_URL}/${accountId}`,
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
          "Не вдалося видалити рахунок"
      );
    }
  },
};