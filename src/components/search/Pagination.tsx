type PaginationProps = {
  page: number;
  total: number;
  pageSize: number;
};

export default function Pagination({ page, total, pageSize }: PaginationProps) {
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <nav>
      <p>
        Mostrando {from}-{to} de {total}
      </p>
    </nav>
  );
}
