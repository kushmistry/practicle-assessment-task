import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type {
  Article,
  ArticleCreatePayload,
  ApiResponse,
  GetArticlesParams,
} from '../../types/article';

export const articlesApi = createApi({
  reducerPath: 'articlesApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  }),
  tagTypes: ['Articles', 'Article'],
  endpoints: (builder) => ({
    getArticles: builder.query<ApiResponse<Article[]>, GetArticlesParams>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.page !== undefined) queryParams.append('page', params.page.toString());
        if (params.page_size !== undefined) queryParams.append('page_size', params.page_size.toString());
        if (params.company_name?.trim()) queryParams.append('company_name', params.company_name.trim());
        if (params.status?.trim()) queryParams.append('status', params.status.trim());
        return `/articles?${queryParams.toString()}`;
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'Article' as const, id })),
              { type: 'Articles', id: 'LIST' },
            ]
          : [{ type: 'Articles', id: 'LIST' }],
    }),

    getArticleById: builder.query<ApiResponse<Article>, number>({
      query: (id) => `/articles/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Article', id }],
    }),

    createArticle: builder.mutation<ApiResponse<Article>, ArticleCreatePayload>({
      query: (body) => ({
        url: '/articles',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Articles', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetArticlesQuery,
  useGetArticleByIdQuery,
  useCreateArticleMutation,
} = articlesApi;

