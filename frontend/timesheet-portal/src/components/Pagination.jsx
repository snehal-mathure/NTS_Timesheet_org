import React, { useMemo } from "react";
import PropTypes from "prop-types";

/**
 * Props
 * - totalItems (number)
 * - page (number)
 * - pageSize (number)
 * - onPageChange (fn: newPage) 
 * - onPageSizeChange (fn: newSize)
 * - pageSizeOptions (array) default [5,10,20,50]
 * - maxButtons (number) default 7
 */
export default function Pagination({
  totalItems,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20, 50],
  maxButtons = 7,
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Ensure page is clamped when rendering page buttons
  const pageClamped = Math.min(Math.max(1, page), totalPages);

  const pageNumbers = useMemo(() => {
    const pages = [];
    let start = Math.max(1, pageClamped - Math.floor(maxButtons / 2));
    let end = start + maxButtons - 1;
    if (end > totalPages) {
      end = totalPages;
      start = Math.max(1, end - maxButtons + 1);
    }
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }, [pageClamped, totalPages, maxButtons]);

  if (totalItems === 0) {
    return null;
  }

  return (
    <div className="mt-4 flex items-center justify-between">
      <div className="text-sm text-slate-600">
        Page {pageClamped} of {totalPages}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(Math.max(1, pageClamped - 1))}
          disabled={pageClamped === 1}
          className="px-3 py-1 rounded-2xl bg-white border border-slate-200 disabled:opacity-40"
        >
          Prev
        </button>

        {pageNumbers.map((pNum) => (
          <button
            key={pNum}
            onClick={() => onPageChange(pNum)}
            className={`px-3 py-1 rounded-2xl border ${
              pNum === pageClamped
                ? "bg-[#4C6FFF] text-white border-[#4C6FFF]"
                : "bg-white border-slate-200 text-slate-700"
            }`}
          >
            {pNum}
          </button>
        ))}

        <button
          onClick={() => onPageChange(Math.min(totalPages, pageClamped + 1))}
          disabled={pageClamped === totalPages}
          className="px-3 py-1 rounded-2xl bg-white border border-slate-200 disabled:opacity-40"
        >
          Next
        </button>

        <select
          value={pageSize}
          onChange={(e) => {
            const newSize = Number(e.target.value);
            onPageSizeChange(newSize);
            // optionally move to page 1 in caller
          }}
          className="rounded-2xl border border-[#e1e4f3] bg-white px-3 py-1 text-sm"
        >
          {pageSizeOptions.map((s) => (
            <option key={s} value={s}>
              {s} / page
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

Pagination.propTypes = {
  totalItems: PropTypes.number.isRequired,
  page: PropTypes.number.isRequired,
  pageSize: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  onPageSizeChange: PropTypes.func.isRequired,
  pageSizeOptions: PropTypes.array,
  maxButtons: PropTypes.number,
};
