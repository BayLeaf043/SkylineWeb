import { authService } from "./authService";

import type {
  ClubProfile,
  Profile,
  UpdateClubProfileRequest,
  UpdateProfileRequest,
} from "../types/profile";

const API_URL = "http://localhost:8080/api";

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
  const accessToken =
    authService.getAccessToken();

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

export const profileService = {
  async getProfile(): Promise<Profile> {
    const response = await fetch(
      `${API_URL}/profile`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(
        await getErrorMessage(
          response,
          "Не вдалося завантажити профіль"
        )
      );
    }

    return response.json();
  },

  async updateProfile(
    request: UpdateProfileRequest
  ): Promise<Profile> {
    const response = await fetch(
      `${API_URL}/profile`,
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
          "Не вдалося оновити профіль"
        )
      );
    }

    return response.json();
  },

  async getClub(): Promise<ClubProfile> {
    const response = await fetch(
      `${API_URL}/profile/club`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(
        await getErrorMessage(
          response,
          "Не вдалося завантажити інформацію про клуб"
        )
      );
    }

    return response.json();
  },

  async updateClub(
    request: UpdateClubProfileRequest
  ): Promise<ClubProfile> {
    const response = await fetch(
      `${API_URL}/profile/club`,
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
          "Не вдалося оновити інформацію про клуб"
        )
      );
    }

    return response.json();
  },
};