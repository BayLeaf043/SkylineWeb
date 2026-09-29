import { authService } from "./authService";

import type {
  Service,
  CreateServiceRequest,
  UpdateServiceRequest,
  UpdateServiceStatusRequest,
} from "../types/service";

const API_URL = "http://localhost:8080/api/services";

async function getErrorMessage(
  response: Response,
  fallback: string
): Promise<string> {
  try {
    const data = await response.json();

    if (data.message) {
      return data.message;
    }
  } catch {
    // Backend повернув не JSON
  }

  return fallback;
}

function getAuthHeaders(): HeadersInit {
  const accessToken = authService.getAccessToken();

  if (!accessToken) {
    throw new Error(
      "Сесія відсутня. Увійдіть у систему повторно."
    );
  }

  return {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };
}

export const serviceService = {
  async getAll(): Promise<Service[]> {
    const response = await fetch(API_URL, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(
        await getErrorMessage(
          response,
          "Не вдалося завантажити послуги"
        )
      );
    }

    return response.json();
  },

  async createService(
    request: CreateServiceRequest
  ): Promise<Service> {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(
        await getErrorMessage(
          response,
          "Не вдалося створити послугу"
        )
      );
    }

    return response.json();
  },

  async updateService(
    serviceId: number,
    request: UpdateServiceRequest
  ): Promise<Service> {
    const response = await fetch(
      `${API_URL}/${serviceId}`,
      {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(request),
      }
    );

    if (!response.ok) {
      throw new Error(
        await getErrorMessage(
          response,
          "Не вдалося оновити послугу"
        )
      );
    }

    return response.json();
  },

  async updateServiceStatus(
      serviceId: number,
      data: UpdateServiceStatusRequest
    ): Promise<Service> {
      const response = await fetch(
        `${API_URL}/${serviceId}/status`,
        {
          method: "PATCH",
          headers: getAuthHeaders(),
          body: JSON.stringify(data),
        }
      );
  
      if (!response.ok) {
        throw new Error(
          await getErrorMessage(
            response,
            "Не вдалося змінити статус послуги"
          )
        );
      }
  
      return response.json();
    },

  async deleteService(
    serviceId: number
  ): Promise<void> {
    const response = await fetch(
      `${API_URL}/${serviceId}`,
      {
        method: "DELETE",
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(
        await getErrorMessage(
          response,
          "Не вдалося видалити послугу"
        )
      );
    }
  },
};