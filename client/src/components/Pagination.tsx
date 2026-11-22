import React from 'react';

interface PaginationProps {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
  onLimitChange: (newLimit: number) => void;
  disabled?: boolean;
}

export const Pagination: React.FC<PaginationProps> = ({
  page,
  limit,
  total,
  totalPages,
  onPageChange,
  onLimitChange,
  disabled = false,
}) => {
  const startItem = total === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-3 px-6 bg-white border-t border-slate-200/80 text-sm text-slate-600">
      {/* Range and total summary */}
      <div className="flex items-center gap-4">
        <span>
          Showing{' '}
          <strong className="font-semibold text-slate-800">
            {startItem}–{endItem}
          </strong>{' '}
          of <strong className="font-semibold text-slate-800">{total}</strong>{' '}
          leads
        </span>

        {/* Page size selector */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <span>Show:</span>
          <select
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            disabled={disabled}
            className="px-2 py-1 text-xs font-medium rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-slate-700"
            aria-label="Leads per page"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {/* Pagination controls */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={disabled || page <= 1}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white hover:bg-slate-50 active:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-slate-700"
          aria-label="Previous page"
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <span>Prev</span>
        </button>

        <span className="text-xs font-medium text-slate-600 px-2">
          Page {page} of {totalPages}
        </span>

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={disabled || page >= totalPages}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white hover:bg-slate-50 active:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-slate-700"
          aria-label="Next page"
        >
          <span>Next</span>
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};
