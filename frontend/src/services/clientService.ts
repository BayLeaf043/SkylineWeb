import { authService } from "./authService";

import type {
  ClientResponse,
  CreateClientRequest,
  UpdateClientRequest,
  UpdateClientStatusRequest,
} from "../types/client";

const API_URL = "http://localhost:8080/api/clients";

const getHeaders = () => {
  const accessToken = authService.getAccessToken();

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
  };
};

export const clientService = {
  async getAll(): Promise<ClientResponse[]> {
    const response = await fetch(API_URL, {
      method: "GET",
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(
        "Не вдалося завантажити список клієнтів"
      );
    }

    return response.json();
  },

  async getById(
    clientId: number
  ): Promise<ClientResponse> {
    const response = await fetch(
      `${API_URL}/${clientId}`,
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
          "Не вдалося завантажити дані клієнта"
      );
    }

    return response.json();
  },

  async createClient(
    data: CreateClientRequest
  ): Promise<ClientResponse> {
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
          "Не вдалося створити клієнта"
      );
    }

    return response.json();
  },

  async updateClient(
    clientId: number,
    data: UpdateClientRequest
  ): Promise<ClientResponse> {
    const response = await fetch(
      `${API_URL}/${clientId}`,
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
          "Не вдалося оновити дані клієнта"
      );
    }

    return response.json();
  },

  async updateClientStatus(
    clientId: number,
    data: UpdateClientStatusRequest
  ): Promise<ClientResponse> {
    const response = await fetch(
      `${API_URL}/${clientId}/status`,
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
          "Не вдалося змінити статус клієнта"
      );
    }

    return response.json();
  },

  async deleteClient(
    clientId: number
  ): Promise<void> {
    const response = await fetch(
      `${API_URL}/${clientId}`,
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
          "Не вдалося видалити клієнта"
      );
    }
  },
};