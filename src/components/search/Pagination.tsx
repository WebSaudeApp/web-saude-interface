import type { ReactNode } from "react";

type PaginationProps = {
  page: number;
  total: number;
  pageSize: number;
  onPageChange?: (page: number) => void;
};

export default function Pagination({
  page,
  total,
  pageSize,
  onPageChange,
}: PaginationProps) {
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const pages = Math.max(1, Math.ceil(total / pageSize));

  if (total === 0) {
    return (
      <nav className="pager">
        <span>Mostrando 0-0 de 0</span>
      </nav>
    );
  }

  const pageNumbers = Array.from(
    new Set(
      [1, 2, 3, pages, page - 1, page, page + 1].filter(
        (n) => n >= 1 && n <= pages,
      ),
    ),
  ).sort((a, b) => a - b);

  const buttons: ReactNode[] = [];
  let last = 0;
  pageNumbers.forEach((n) => {
    if (last && n - last > 1) {
      buttons.push(<span key={`ellipsis-${n}`}>…</span>);
    }
    buttons.push(
      <button
        key={n}
        type="button"
        className={n === page ? "is-active" : undefined}
        onClick={() => onPageChange?.(n)}
      >
        {n}
      </button>,
    );
    last = n;
  });

  return (
    <nav className="pager">
      <span>
        Mostrando {from}–{to} de {total}
      </span>
      <div className="pager-pages">
        <button
          type="button"
          disabled={page === 1}
          onClick={() => onPageChange?.(page - 1)}
        >
          Anterior
        </button>
        {buttons}
        <button
          type="button"
          disabled={page === pages}
          onClick={() => onPageChange?.(page + 1)}
        >
          Próximo
        </button>
      </div>
    </nav>
  );
}
