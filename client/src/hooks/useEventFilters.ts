import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

export type EventFiltersState = {
  status: "upcoming" | "past";
  type: "public" | "private" | "";
  tags: string;
  q: string;
  page: number;
};

export function useEventFilters() {
  const [params, setParams] = useSearchParams();

  const filters = useMemo<EventFiltersState>(
    () => ({
      status: params.get("status") === "past" ? "past" : "upcoming",
      type: (params.get("type") ?? "") as "public" | "private" | "",
      tags: params.get("tags") ?? "",
      q: params.get("q") ?? "",
      page: Math.max(1, Number(params.get("page") ?? "1")),
    }),
    [params],
  );

  const setFilter = useCallback(
    (key: keyof EventFiltersState, value: string | number) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          // Any filter change resets to page 1
          if (key !== "page") next.set("page", "1");
          if (value === "" || value === undefined || value === null) {
            next.delete(key);
          } else {
            next.set(key, String(value));
          }
          return next;
        },
        { replace: true },
      );
    },
    [setParams],
  );

  const setPage = useCallback(
    (page: number) => {
      setFilter("page", page);
    },
    [setFilter],
  );

  return { filters, setFilter, setPage };
}
