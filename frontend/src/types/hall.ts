export interface Hall {
  hallId: number;
  title: string;
  description: string | null;
  capacity: number;
  status: boolean;
  createdAt: string;
}

export interface CreateHallRequest {
  title: string;
  description?: string | null;
  capacity: number;
}

export interface UpdateHallRequest {
  title: string;
  description?: string | null;
  capacity: number;
}

export interface UpdateHallStatusRequest {
  status: boolean;
}