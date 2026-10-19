import { useEffect, useMemo, useRef, useState } from "react";
import type { GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import ExploreUnitItem from "@/components/resultView/ExploreUnitItem";
import ResultsMap, { type MapPin } from "@/components/resultView/ResultsMap";
import {
  emptyExploreFilters,
  ExploreFiltersPanel,
  ExploreSearchBar,
  type ExploreFilters,
} from "@/components/search/ExploreFilters";
import { unidadeTypeLabels } from "@/configs/DisplayFields";
import unidadesDestaque from "@/configs/UnidadesDestaque";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { normalizeText } from "@/lib/text";
import type { Unidade, UnidadeTipo } from "@/types/Entities";

const BATCH_SIZE = 4;

type Sort = "nome" | "distancia" | "avaliacao";

const sortLabels: Record<Sort, string> = {
  nome: "Em ordem de nome",
  distancia: "Mais próximos",
  avaliacao: "Melhor avaliação",
};

// URL query keys for each filter, so a filtered list can be shared.
const queryKeys: Record<keyof ExploreFilters, string> = {
  term: "q",
  type: "tipo",
  specialty: "especialidade",
  city: "cidade",
  uf: "uf",
};

const specialties = Array.from(
  new Set(unidadesDestaque.flatMap((unidade) => unidade.specialties)),
).sort((a, b) => a.localeCompare(b, "pt-BR"));

function matches(unidade: Unidade, filters: ExploreFilters) {
  const term = normalizeText(filters.term);
  const city = normalizeText(filters.city);
  return (
    (!term ||
      normalizeText(
        `${unidade.name} ${unidade.specialties.join(" ")}`,
      ).includes(term)) &&
    (!filters.type || unidade.type === filters.type) &&
    (!filters.specialty || unidade.specialties.includes(filters.specialty)) &&
    (!city || normalizeText(unidade.address.city).includes(city)) &&
    (!filters.uf || unidade.address.state === filters.uf)
  );
}

function compare(sort: Sort) {
  return (a: Unidade, b: Unidade) => {
    if (sort === "avaliacao") {
      return b.rating - a.rating;
    }
    if (sort === "distancia") {
      return a.distanceKm - b.distanceKm;
    }
    return a.name.localeCompare(b.name, "pt-BR");
  };
}

type FilterChip = {
  key: string;
  label: string;
  clear: Partial<ExploreFilters>;
};

function buildChips(filters: ExploreFilters): FilterChip[] {
  const chips: FilterChip[] = [];
  if (filters.term.trim()) {
    chips.push({
      key: "term",
      label: `“${filters.term.trim()}”`,
      clear: { term: "" },
    });
  }
  if (filters.type) {
    chips.push({
      key: "type",
      label: unidadeTypeLabels[filters.type],
      clear: { type: "" },
    });
  }
  if (filters.specialty) {
    chips.push({
      key: "specialty",
      label: filters.specialty,
      clear: { specialty: "" },
    });
  }
  const city = filters.city.trim();
  if (city || filters.uf) {
    chips.push({
      key: "place",
      label: [city, filters.uf].filter(Boolean).join(" – "),
      clear: { city: "", uf: "" },
    });
  }
  return chips;
}

type HomePageProps = {
  initialFilters: ExploreFilters;
};

export default function HomePage({ initialFilters }: HomePageProps) {
  const router = useRouter();
  const [filters, setFilters] = useState<ExploreFilters>(initialFilters);
  const [sort, setSort] = useState<Sort>("nome");
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [pendingScrollId, setPendingScrollId] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  const results = useMemo(
    () =>
      unidadesDestaque
        .filter((unidade) => matches(unidade, filters))
        .sort(compare(sort)),
    [filters, sort],
  );

  const { visible, hasMore, loading, sentinelRef, ensureVisible } =
    useInfiniteScroll(results, BATCH_SIZE);

  // Pins are numbered in list order, skipping units without a location.
  const pins = useMemo(() => {
    const list: MapPin[] = [];
    for (const unidade of results) {
      if (unidade.location) {
        list.push({
          id: unidade.id,
          number: list.length + 1,
          name: unidade.name,
          location: unidade.location,
        });
      }
    }
    return list;
  }, [results]);

  const markerById = useMemo(
    () => new Map(pins.map((pin) => [pin.id, pin.number])),
    [pins],
  );

  const chips = buildChips(filters);

  useEffect(() => {
    listRef.current?.scrollTo({ top: 0 });
  }, [results]);

  useEffect(() => {
    const query: Record<string, string> = {};
    (Object.keys(queryKeys) as (keyof ExploreFilters)[]).forEach((key) => {
      const value = filters[key].trim();
      if (value) {
        query[queryKeys[key]] = value;
      }
    });
    void router.replace({ pathname: router.pathname, query }, undefined, {
      shallow: true,
      scroll: false,
    });
    // router is stable for this purpose; re-running on it would loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  // A pin can point at a unit that is not loaded yet: load up to it first,
  // then scroll once it is in the DOM.
  useEffect(() => {
    if (!pendingScrollId) {
      return;
    }
    const element = listRef.current?.querySelector<HTMLElement>(
      `[data-unit-id="${pendingScrollId}"]`,
    );
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "nearest" });
      setPendingScrollId(null);
    }
  }, [pendingScrollId, visible]);

  function handleSelectPin(id: string) {
    ensureVisible(results.findIndex((unidade) => unidade.id === id));
    setHighlightedId(id);
    setPendingScrollId(id);
  }

  return (
    <>
      <Head>
        <title>Web Saúde</title>
      </Head>
      <div className="explore">
        <ExploreFiltersPanel
          value={filters}
          specialties={specialties}
          onChange={setFilters}
        />
        <div className="explore-main">
          <ExploreSearchBar value={filters} onChange={setFilters} />

          <div className="explore-head">
            <div>
              <h1>
                {results.length === 1
                  ? "1 estabelecimento encontrado"
                  : `${results.length} estabelecimentos encontrados`}
              </h1>
              {chips.length > 0 && (
                <div className="explore-chips">
                  <span>Filtros:</span>
                  {chips.map((chip) => (
                    <span className="filter-chip" key={chip.key}>
                      {chip.label}
                      <button
                        type="button"
                        aria-label={`Remover filtro ${chip.label}`}
                        onClick={() =>
                          setFilters({ ...filters, ...chip.clear })
                        }
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <button
                    type="button"
                    className="link-button"
                    onClick={() => setFilters(emptyExploreFilters)}
                  >
                    Limpar filtros
                  </button>
                </div>
              )}
            </div>
            <select
              className="select explore-sort"
              value={sort}
              onChange={(event) => setSort(event.target.value as Sort)}
              aria-label="Ordenar resultados"
            >
              {(Object.keys(sortLabels) as Sort[]).map((value) => (
                <option key={value} value={value}>
                  {sortLabels[value]}
                </option>
              ))}
            </select>
          </div>

          <div className="explore-results">
            <div className="explore-list" ref={listRef}>
              {results.length === 0 ? (
                <p className="center-note">
                  Nenhum estabelecimento encontrado com esses filtros.
                </p>
              ) : (
                <>
                  {visible.map((unidade) => (
                    <ExploreUnitItem
                      key={unidade.id}
                      unidade={unidade}
                      marker={markerById.get(unidade.id) ?? null}
                      highlighted={unidade.id === highlightedId}
                      onHover={setHighlightedId}
                    />
                  ))}
                  {hasMore ? (
                    <div className="explore-loading" ref={sentinelRef}>
                      {loading && "Carregando mais estabelecimentos…"}
                    </div>
                  ) : (
                    <p className="explore-end">Você chegou ao fim da lista.</p>
                  )}
                </>
              )}
            </div>
            <ResultsMap
              pins={pins}
              total={results.length}
              highlightedId={highlightedId}
              onHover={setHighlightedId}
              onSelect={handleSelectPin}
            />
          </div>
        </div>
      </div>
    </>
  );
}

function readQuery(value: string | string[] | undefined) {
  return typeof value === "string" ? value : "";
}

// Reads the filters from the URL on the server so a shared link renders
// already filtered, without a flash of the unfiltered list.
export const getServerSideProps: GetServerSideProps<HomePageProps> = async ({
  query,
}) => {
  const type = readQuery(query[queryKeys.type]);
  return {
    props: {
      initialFilters: {
        term: readQuery(query[queryKeys.term]),
        type: type in unidadeTypeLabels ? (type as UnidadeTipo) : "",
        specialty: readQuery(query[queryKeys.specialty]),
        city: readQuery(query[queryKeys.city]),
        uf: readQuery(query[queryKeys.uf]),
      },
    },
  };
};
