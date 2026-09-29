export interface Profile {
  userId: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  birthDate: string | null;
  email: string;
  role: string;
}

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  phone?: string | null;
  birthDate?: string | null;
}

export interface ClubProfile {
  clubId: number;
  title: string;
  city: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  description: string | null;
}

export interface UpdateClubProfileRequest {
  title: string;
  city?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  description?: string | null;
}