export interface SuccessResponse<T> {
  success: true;
  data: T;
  message: string | null;
}

export interface ErrorResponse {
  success: false;
  error: string;
  detail?: string | null;
}

export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

export interface PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  has_next: boolean;
}
