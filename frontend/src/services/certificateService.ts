import { authService } from "./authService";

import type {
  CertificateResponse,
  UpdateCertificateValidityRequest,
} from "../types/certificate";

const API_URL =
  "http://localhost:8080/api/certificates";

const getHeaders = () => {
  const accessToken = authService.getAccessToken();

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
  };
};

export const certificateService = {
  async getAll(): Promise<CertificateResponse[]> {
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
          "Не вдалося завантажити список сертифікатів"
      );
    }

    return response.json();
  },

  async getById(
    certificateId: number
  ): Promise<CertificateResponse> {
    const response = await fetch(
      `${API_URL}/${certificateId}`,
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
          "Не вдалося завантажити дані сертифіката"
      );
    }

    return response.json();
  },

  async updateValidity(
    certificateId: number,
    data: UpdateCertificateValidityRequest
  ): Promise<CertificateResponse> {
    const response = await fetch(
      `${API_URL}/${certificateId}/validity`,
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
          "Не вдалося змінити термін дії сертифіката"
      );
    }

    return response.json();
  },

  async deleteCertificate(
    certificateId: number
  ): Promise<void> {
    const response = await fetch(
      `${API_URL}/${certificateId}`,
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
          "Не вдалося видалити сертифікат"
      );
    }
  },
};