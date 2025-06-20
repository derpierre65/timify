type ApiPaginationResponse<T> = {
  data: T[];
  meta: ApiPaginationMeta;
};

type ApiPaginationMeta = {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
  from: number | null;
  to: number | null;
};

export {
  type ApiPaginationResponse,
  type ApiPaginationMeta,
};
