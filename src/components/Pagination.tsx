'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  itemLabel?: string;
}

/** Builds visible page numbers with ellipsis markers when page count exceeds 7. */
function buildPageTokens(currentPage: number, totalPages: number): Array<number | 'ellipsis'> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const tokens: Array<number | 'ellipsis'> = [1];
  const left = Math.max(2, currentPage - 1);
  const right = Math.min(totalPages - 1, currentPage + 1);

  if (left > 2) tokens.push('ellipsis');
  for (let p = left; p <= right; p += 1) {
    tokens.push(p);
  }
  if (right < totalPages - 1) tokens.push('ellipsis');
  tokens.push(totalPages);

  return tokens;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  itemLabel = 'item',
}) => {
  const totalPages = Math.ceil(totalItems / pageSize);
  if (totalPages <= 1) return null;

  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const startItem = (safePage - 1) * pageSize + 1;
  const endItem = Math.min(safePage * pageSize, totalItems);
  const tokens = buildPageTokens(safePage, totalPages);

  return (
    <nav
      aria-label="Navigasi halaman"
      className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100"
    >
      <p className="text-xs text-slate-500 font-medium">
        Menampilkan <span className="font-bold text-slate-800">{startItem}–{endItem}</span> dari{' '}
        <span className="font-bold text-slate-800">{totalItems}</span> {itemLabel}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(safePage - 1)}
          disabled={safePage <= 1}
          aria-label="Halaman sebelumnya"
          className="inline-flex items-center justify-center h-9 px-3 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-sky-50 hover:border-sky-200 hover:text-sky-700 text-xs font-bold transition disabled:opacity-40 disabled:pointer-events-none"
        >
          <ChevronLeft className="w-4 h-4 mr-0.5" />
          <span>Sebelumnya</span>
        </button>

        {tokens.map((token, idx) =>
          token === 'ellipsis' ? (
            <span
              key={`ellipsis-${idx}`}
              className="inline-flex items-center justify-center w-9 h-9 text-xs font-bold text-slate-400 select-none"
            >
              ...
            </span>
          ) : (
            <button
              key={token}
              type="button"
              onClick={() => onPageChange(token)}
              aria-label={`Halaman ${token}`}
              aria-current={token === safePage ? 'page' : undefined}
              className={`inline-flex items-center justify-center min-w-[2.25rem] h-9 px-3 rounded-xl text-xs font-extrabold transition ${
                token === safePage
                  ? 'bg-sky-500 text-white shadow-md shadow-sky-200 border border-sky-500'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-sky-50 hover:border-sky-200 hover:text-sky-700'
              }`}
            >
              {token}
            </button>
          )
        )}

        <button
          type="button"
          onClick={() => onPageChange(safePage + 1)}
          disabled={safePage >= totalPages}
          aria-label="Halaman berikutnya"
          className="inline-flex items-center justify-center h-9 px-3 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-sky-50 hover:border-sky-200 hover:text-sky-700 text-xs font-bold transition disabled:opacity-40 disabled:pointer-events-none"
        >
          <span>Selanjutnya</span>
          <ChevronRight className="w-4 h-4 ml-0.5" />
        </button>
      </div>
    </nav>
  );
};

