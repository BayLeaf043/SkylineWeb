import { authService } from "./authService";

import type {
  Hall,
  CreateHallRequest,
  UpdateHallRequest,
  UpdateHallStatusRequest,
} from "../types/hall";

const API_URL = "http://localhost:8080/api/halls";

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

export const hallService = {
  async getAll(): Promise<Hall[]> {
    const response = await fetch(API_URL, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(
        await getErrorMessage(
          response,
          "Не вдалося завантажити список залів"
        )
      );
    }

    return response.json();
  },

  async createHall(
    data: CreateHallRequest
  ): Promise<Hall> {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(
        await getErrorMessage(
          response,
          "Не вдалося створити зал"
        )
      );
    }

    return response.json();
  },

  async updateHall(
    hallId: number,
    data: UpdateHallRequest
  ): Promise<Hall> {
    const response = await fetch(
      `${API_URL}/${hallId}`,
      {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      throw new Error(
        await getErrorMessage(
          response,
          "Не вдалося оновити зал"
        )
      );
    }

    return response.json();
  },

  async updateHallStatus(
    hallId: number,
    data: UpdateHallStatusRequest
  ): Promise<Hall> {
    const response = await fetch(
      `${API_URL}/${hallId}/status`,
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
          "Не вдалося змінити статус залу"
        )
      );
    }

    return response.json();
  },

  async deleteHall(
    hallId: number
  ): Promise<void> {
    const response = await fetch(
      `${API_URL}/${hallId}`,
      {
        method: "DELETE",
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(
        await getErrorMessage(
          response,
          "Не вдалося видалити зал"
        )
      );
    }
  },
};