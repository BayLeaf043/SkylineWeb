import { authService } from "./authService";

import type {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  UpdateCategoryStatusRequest,
} from "../types/category";

const API_URL = "http://localhost:8080/api/categories";

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

export const categoryService = {
  async getAll(): Promise<Category[]> {
    const response = await fetch(API_URL, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(
        await getErrorMessage(
          response,
          "Не вдалося завантажити категорії"
        )
      );
    }

    return response.json();
  },

  async createCategory(
    request: CreateCategoryRequest
  ): Promise<Category> {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(
        await getErrorMessage(
          response,
          "Не вдалося створити категорію"
        )
      );
    }

    return response.json();
  },

  async updateCategory(
    categoryId: number,
    request: UpdateCategoryRequest
  ): Promise<Category> {
    const response = await fetch(
      `${API_URL}/${categoryId}`,
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
          "Не вдалося оновити категорію"
        )
      );
    }

    return response.json();
  },


  async updateCategoryStatus(
      categoryId: number,
      data: UpdateCategoryStatusRequest
    ): Promise<Category> {
      const response = await fetch(
        `${API_URL}/${categoryId}/status`,
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
            "Не вдалося змінити статус категорії"
          )
        );
      }
  
      return response.json();
    },

  async deleteCategory(
    categoryId: number
  ): Promise<void> {
    const response = await fetch(
      `${API_URL}/${categoryId}`,
      {
        method: "DELETE",
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(
        await getErrorMessage(
          response,
          "Не вдалося видалити категорію"
        )
      );
    }
  },
};