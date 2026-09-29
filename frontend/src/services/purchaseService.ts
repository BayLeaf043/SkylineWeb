import { authService } from "./authService";

import type {
  PurchaseResponse,
  CreatePurchaseRequest,
  RefundPurchaseRequest,
} from "../types/purchase";

const API_URL =
  "http://localhost:8080/api/purchases";

const getHeaders = () => {
  const accessToken = authService.getAccessToken();

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
  };
};

export const purchaseService = {
  async getAll(): Promise<PurchaseResponse[]> {
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
          "Не вдалося завантажити список покупок"
      );
    }

    return response.json();
  },

  async getById(
    purchaseId: number
  ): Promise<PurchaseResponse> {
    const response = await fetch(
      `${API_URL}/${purchaseId}`,
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
          "Не вдалося завантажити дані покупки"
      );
    }

    return response.json();
  },

  async createPurchase(
    data: CreatePurchaseRequest
  ): Promise<PurchaseResponse> {
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
          "Не вдалося оформити покупку"
      );
    }

    return response.json();
  },

  async refundPurchase(
    purchaseId: number,
    data: RefundPurchaseRequest
  ): Promise<PurchaseResponse> {
    const response = await fetch(
      `${API_URL}/${purchaseId}/refund`,
      {
        method: "POST",
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
          "Не вдалося виконати повернення коштів"
      );
    }

    return response.json();
  },
};