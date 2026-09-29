export interface Category {
  categoryId: number;
  title: string;
  status: boolean;
  createdAt: string;
}

export interface CreateCategoryRequest {
  title: string;
}

export interface UpdateCategoryRequest {
  title: string;
}

export interface UpdateCategoryStatusRequest {
  status: boolean;
}