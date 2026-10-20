export interface Article {
  id: number;
  company_name: string;
  title: string;
  url: string;
  content: string;
  status: string;
  category: string | null;
  summary: string | null;
  created_at: string;
}

export interface ArticleCreatePayload {
  company_name: string;
  title: string;
  url: string;
  content: string;
}

export interface PaginationMeta {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

export interface ApiResponse<T> {
  status: 'success' | 'error';
  message: string;
  data: T;
  meta: PaginationMeta | null;
}

export interface ApiErrorResponse {
  status: 'error';
  message: string;
  data?: Array<{ field: string; message: string; type: string }> | null;
  meta?: null;
}

export interface GetArticlesParams {
  page?: number;
  page_size?: number;
  company_name?: string;
  status?: string;
}

