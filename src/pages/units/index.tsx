import { useEffect, useMemo, useState } from "react";
import type { GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import UnidadeRow from "@/components/resultView/UnidadeRow";
import FiltersSidebar, {
  type Filters,
} from "@/components/search/FiltersSidebar";
import ResultsSearchDock from "@/components/search/ResultsSearchDock";
import Pagination from "@/components/search/Pagination";
import unidadesDestaque from "@/configs/UnidadesDestaque";

const PAGE_SIZE = 3;

const defaultFilters: Filters = {
  openNow: true,
  hasInsurance: true,
  open24h: false,
  minRating: 4,
};

type Sort = "distancia" | "avaliacao";

export default function UnidadesPage() {
  const router = useRouter();
  const cidade =
    typeof router.query.cidade === "string" ? router.query.cidade : "São Paulo";
  const term = typeof router.query.q === "string" ? router.query.q : "";

  const [sort, setSort] = useState<Sort>("distancia");
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [cidade, term]);

  const results = useMemo(() => {
    const termLower = term.trim().toLowerCase();
    const list = unidadesDestaque.filter((unidade) => {
      const cidadeOk =
        unidade.address.city.toLowerCase() === cidade.toLowerCase();
      const termOk =
        !termLower ||
        `${unidade.name} ${unidade.specialties.join(" ")}`
          .toLowerCase()
          .includes(termLower);
      const openNowOk = !filters.openNow || unidade.openNow;
      const insuranceOk =
        !filters.hasInsurance || unidade.insurances.length > 0;
      const open24hOk = !filters.open24h || unidade.open24h;
      const ratingOk = unidade.rating >= filters.minRating;
      return (
        cidadeOk && termOk && openNowOk && insuranceOk && open24hOk && ratingOk
      );
    });

    return list.sort((a, b) =>
      sort === "avaliacao" ? b.rating - a.rating : a.distanceKm - b.distanceKm,
    );
  }, [cidade, term, filters, sort]);

  const start = (page - 1) * PAGE_SIZE;
  const pageItems = results.slice(start, start + PAGE_SIZE);

  function handleApplyFilters(next: Filters) {
    setFilters(next);
    setPage(1);
  }

  function handleSortChange(next: Sort) {
    setSort(next);
    setPage(1);
  }

  return (
    <>
      <Head>
        <title>{`Resultados em ${cidade} | Web Saúde`}</title>
      </Head>
      <div className="results-head">
        <div>
          <h1>Resultados em {cidade}</h1>
          <p className="help">{results.length} unidades encontradas</p>
        </div>
        <select
          className="select"
          value={sort}
          onChange={(event) => handleSortChange(event.target.value as Sort)}
        >
          <option value="distancia">Mais próximo</option>
          <option value="avaliacao">Melhor avaliação</option>
        </select>
      </div>
      <div className="results-layout">
        <FiltersSidebar
          initialFilters={defaultFilters}
          onApply={handleApplyFilters}
        />
        <div className="list">
          {pageItems.length === 0 ? (
            <p className="center-note">Nenhuma unidade encontrada.</p>
          ) : (
            pageItems.map((unidade) => (
              <UnidadeRow key={unidade.id} unidade={unidade} />
            ))
          )}
          <Pagination
            page={page}
            total={results.length}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        </div>
      </div>
      <ResultsSearchDock initialTerm={term} initialCidade={cidade} />
    </>
  );
}

// Forces per-request rendering so router.query already has `cidade`/`q` on
// the first paint instead of only after client hydration.
export const getServerSideProps: GetServerSideProps = async () => {
  return { props: {} };
};
