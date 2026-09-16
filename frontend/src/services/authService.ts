import type {
  CurrentUser,
  LoginRequest,
  LoginResponse,
  RegisterClubRequest,
  RegisterClubResponse,
} from "../types/auth";


const API_URL = "http://localhost:8080/api";

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

export const authService = {

  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  saveTokens(tokens: LoginResponse) {
    localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
  },

  clearTokens() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },

  async login(request: LoginRequest): Promise<LoginResponse> {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Неправильний email або пароль");
      }

      throw new Error("Не вдалося виконати вхід");
    }

    return response.json();
  },

  async getMe(accessToken: string): Promise<CurrentUser> {
    const response = await fetch(`${API_URL}/auth/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw {
        status: response.status,
      };
    }

    return response.json();
  },

  async refresh(): Promise<LoginResponse> {
    const refreshToken = this.getRefreshToken();

    if (!refreshToken) {
      throw new Error("Refresh token is missing");
    }

    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refreshToken,
      }),
    });

    if (!response.ok) {
      throw new Error("Unable to refresh session");
    }

    const tokens: LoginResponse = await response.json();

    this.saveTokens(tokens);

    return tokens;
  },

  async registerClub(request: RegisterClubRequest): Promise<RegisterClubResponse> {
   const response = await fetch(`${API_URL}/auth/register-club`, {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
    });

    if (!response.ok) {
       let message = "Не вдалося зареєструвати клуб";

        try {
            const errorData = await response.json();

        if (errorData.message) {
            message = errorData.message;
        }
    } catch {
      // якщо backend повернув не JSON
    }

    throw new Error(message);
  }

  return response.json();
},

  async logout(): Promise<void> {
    const accessToken = this.getAccessToken();

    if (accessToken) {
      try {
        await fetch(`${API_URL}/auth/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
      } catch (error) {
        console.error("Backend logout failed:", error);
      }
    }

    this.clearTokens();
  },
};