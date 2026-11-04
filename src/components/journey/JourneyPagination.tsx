import { ChevronLeft, ChevronRight } from "lucide-react";

interface JourneyPaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

export default function JourneyPagination({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
}: JourneyPaginationProps) {
  const start = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <div className="flex flex-col gap-3 px-1 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-[11px] text-crm-muted">
        Showing <span className="font-semibold text-crm-text">{start}–{end}</span> of{" "}
        <span className="font-semibold text-crm-text">{totalItems}</span> journeys
      </p>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label="Previous page"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-crm-border bg-white text-crm-muted transition hover:border-crm-primary hover:text-crm-primary-dark disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft size={16} />
        </button>

        {pages.map((page) => (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            aria-label={`Go to page ${page}`}
            aria-current={currentPage === page ? "page" : undefined}
            className={`h-8 min-w-8 rounded-lg px-2 text-[11px] font-semibold transition ${
              currentPage === page
                ? "bg-crm-primary text-white"
                : "border border-crm-border bg-white text-crm-text hover:border-crm-primary hover:text-crm-primary-dark"
            }`}
          >
            {page}
          </button>
        ))}

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          aria-label="Next page"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-crm-border bg-white text-crm-muted transition hover:border-crm-primary hover:text-crm-primary-dark disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
