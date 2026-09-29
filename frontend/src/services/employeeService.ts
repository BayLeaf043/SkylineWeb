import { authService } from "./authService";

import type {
  EmployeeResponse,
  CreateAdminRequest,
  CreateTrainerRequest,
  UpdateEmployeeRequest,
  UpdateEmployeeStatusRequest,
} from "../types/employee";

const API_URL = "http://localhost:8080/api/employees";

const getHeaders = () => {
  const accessToken = authService.getAccessToken();

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
  };
};

export const employeeService = {
  async getAll(): Promise<EmployeeResponse[]> {
    const response = await fetch(API_URL, {
      method: "GET",
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(
        "Не вдалося завантажити список працівників"
      );
    }

    return response.json();
  },

  async createAdmin(
    data: CreateAdminRequest
  ): Promise<EmployeeResponse> {
    const response = await fetch(`${API_URL}/admins`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => null);

      throw new Error(
        error?.message ||
          "Не вдалося створити адміністратора"
      );
    }

    return response.json();
  },

  async createTrainer(
    data: CreateTrainerRequest
  ): Promise<EmployeeResponse> {
    const response = await fetch(`${API_URL}/trainers`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => null);

      throw new Error(
        error?.message ||
          "Не вдалося створити тренера"
      );
    }

    return response.json();
  },

  async getById(
    userId: number
  ): Promise<EmployeeResponse> {
    const response = await fetch(
      `${API_URL}/${userId}`,
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
          "Не вдалося завантажити дані працівника"
      );
    }

    return response.json();
  },

  async update(
    userId: number,
    data: UpdateEmployeeRequest
  ): Promise<EmployeeResponse> {
    const response = await fetch(
      `${API_URL}/${userId}`,
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
          "Не вдалося оновити дані працівника"
      );
    }

    return response.json();
  },

  async updateStatus(
    userId: number,
    data: UpdateEmployeeStatusRequest
  ): Promise<EmployeeResponse> {
    const response = await fetch(
      `${API_URL}/${userId}/status`,
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
          "Не вдалося змінити статус працівника"
      );
    }

    return response.json();
  },

  async deleteEmployee(
    userId: number
  ): Promise<void> {
    const response = await fetch(
      `${API_URL}/${userId}`,
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
          "Не вдалося видалити працівника"
      );
    }
  },
};