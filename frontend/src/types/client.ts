export interface ClientResponse {
  clientId: number;
  userId: number;

  firstName: string;
  lastName: string;

  phone: string | null;
  birthDate: string | null;

  status: boolean;

  lastVisit: string | null;
  countOfVisits: number;

  createdAt: string;
}

export interface CreateClientRequest {
  firstName: string;
  lastName: string;
  phone: string;
  birthDate: string;
}

export interface UpdateClientRequest {
  firstName: string;
  lastName: string;
  phone: string;
  birthDate: string;
}

export interface UpdateClientStatusRequest {
  status: boolean;
}