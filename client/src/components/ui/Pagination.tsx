import { memo } from "react";

type PaginationProps = {
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
};

export const Pagination = memo(function Pagination({ page, limit, total, onPageChange }: PaginationProps) {
  const totalPages = Math.ceil(total / limit);
  if (totalPages <= 1) return null;

  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="flex items-center justify-between text-sm text-[#777]">
      <span>
        Showing {from}–{to} of {total}
      </span>
      <div className="flex items-center gap-4">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="font-mono text-xs text-[#111] transition-opacity hover:opacity-50 disabled:cursor-not-allowed disabled:opacity-30"
        >
          ← Prev
        </button>
        <span className="font-mono text-xs">
          {page} / {totalPages}
        </span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="font-mono text-xs text-[#111] transition-opacity hover:opacity-50 disabled:cursor-not-allowed disabled:opacity-30"
        >
          Next →
        </button>
      </div>
    </div>
  );
});
