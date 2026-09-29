export interface Direction {
  directionId: number;
  title: string;
  status: boolean;
  createdAt: string;
}

export interface CreateDirectionRequest {
  title: string;
}

export interface UpdateDirectionRequest {
  title: string;
}

export interface UpdateDirectionStatusRequest {
  status: boolean;
}