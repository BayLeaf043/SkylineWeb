export interface Service {
  serviceId: number;
  categoryId: number;
  categoryTitle: string;
  directionId: number;
  directionTitle: string;
  title: string;
  description: string | null;
  price: number;
  sessionsCount: number;
  validityDays: number;
  status: boolean;
  createdAt: string;
}

export interface CreateServiceRequest {
  categoryId: number;
  directionId: number;
  title: string;
  description?: string | null;
  price: number;
  sessionsCount: number;
  validityDays: number;
}

export interface UpdateServiceRequest {
  categoryId: number;
  directionId: number;
  title: string;
  description?: string | null;
  price: number;
  sessionsCount: number;
  validityDays: number;
}

export interface UpdateServiceStatusRequest {
  status: boolean;
}