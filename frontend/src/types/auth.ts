export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

export interface CurrentUser {
  userId: string;
  firstName: string;
  lastName: string;
  role: "ADMIN" | "TRAINER";
  clubId: number;
  clubName: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RegisterClubRequest {
  clubName: string;
  city: string;
  firstName: string;
  lastName: string;
  phone?: string;
  birthDate?: string;

  email: string;
  password: string;
}

export interface RegisterClubResponse {
  userId: string;
  clubId: number;
  role: "ADMIN" | "TRAINER";
  message: string;
}