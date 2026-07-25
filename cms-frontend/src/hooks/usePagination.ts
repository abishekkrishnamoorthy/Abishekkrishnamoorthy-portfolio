import { useSearchParams } from "react-router-dom";

export function usePagination(defaults = { page: 1, pageSize: 10 }) {
  const [params, setParams] = useSearchParams();
  const page = Number(params.get("page") ?? defaults.page);
  const pageSize = Number(params.get("pageSize") ?? defaults.pageSize);
  const setPage = (nextPage: number) => {
    const next = new URLSearchParams(params);
    next.set("page", String(nextPage));
    next.set("pageSize", String(pageSize));
    setParams(next);
  };
  return { page, pageSize, setPage };
}
