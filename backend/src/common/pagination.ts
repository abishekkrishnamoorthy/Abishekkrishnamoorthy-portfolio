export type PaginationInput = { page?: number; pageSize?: number };

export function normalizePagination(input: PaginationInput, defaults = { page: 1, pageSize: 10 }, maxPageSize = 50) {
  const page = Math.max(1, Math.trunc(input.page ?? defaults.page));
  const pageSize = Math.min(maxPageSize, Math.max(1, Math.trunc(input.pageSize ?? defaults.pageSize)));
  const skip = (page - 1) * pageSize;
  return { page, pageSize, skip, limit: pageSize };
}

export function pageMeta(total: number, page: number, pageSize: number) {
  const hasNextPage = page * pageSize < total;
  return { hasNextPage, nextPage: hasNextPage ? page + 1 : undefined, total };
}
