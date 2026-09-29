import { authService } from "./authService";

import type {
  Direction,
  CreateDirectionRequest,
  UpdateDirectionRequest,
  UpdateDirectionStatusRequest,
} from "../types/direction";

const API_URL = "http://localhost:8080/api/directions";

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

export const directionService = {
  async getAll(): Promise<Direction[]> {
    const response = await fetch(API_URL, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(
        await getErrorMessage(
          response,
          "Не вдалося завантажити напрямки"
        )
      );
    }

    return response.json();
  },

  async createDirection(
    request: CreateDirectionRequest
  ): Promise<Direction> {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(
        await getErrorMessage(
          response,
          "Не вдалося створити напрямок"
        )
      );
    }

    return response.json();
  },

  async updateDirection(
    directionId: number,
    request: UpdateDirectionRequest
  ): Promise<Direction> {
    const response = await fetch(
      `${API_URL}/${directionId}`,
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
          "Не вдалося оновити напрямок"
        )
      );
    }

    return response.json();
  },


  async updateDirectionStatus(
      directionId: number,
      data: UpdateDirectionStatusRequest
    ): Promise<Direction> {
      const response = await fetch(
        `${API_URL}/${directionId}/status`,
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
            "Не вдалося змінити статус напрямку"
          )
        );
      }
  
      return response.json();
    },

  async deleteDirection(
    directionId: number
  ): Promise<void> {
    const response = await fetch(
      `${API_URL}/${directionId}`,
      {
        method: "DELETE",
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(
        await getErrorMessage(
          response,
          "Не вдалося видалити напрямок"
        )
      );
    }
  },
};