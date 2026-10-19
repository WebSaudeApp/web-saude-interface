import { useEffect, useMemo, useRef, useState } from "react";
import type { GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import ExploreUnitItem from "@/components/resultView/ExploreUnitItem";
import ResultsMap, { type MapPin } from "@/components/resultView/ResultsMap";
import {
  defaultRadiusKm,
  emptyExploreFilters,
  ExploreFiltersPanel,
  ExploreSearchBar,
  radiusOptions,
  type ExploreFilters,
} from "@/components/search/ExploreFilters";
import { unidadeTypeLabels } from "@/configs/DisplayFields";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { useEspecialidades, useUnidadesSearch } from "@/hooks/useUnidades";
import { apiTipoByType } from "@/lib/estabelecimentoAdapter";
import { formatDistance, parseGeoPoint, roundCoordinate } from "@/lib/geo";
import { reverseGeocode, type Place } from "@/lib/reverseGeocode";
import type { EstabelecimentoSearchParams } from "@/services/UnidadeService";
import type { GeoPoint, UnidadeTipo } from "@/types/Entities";

// Page size asked to the API on each scroll step.
const PAGE_SIZE = 10;

// URL query keys for each filter, so a filtered list can be shared.
const queryKeys: Record<keyof ExploreFilters, string> = {
  term: "q",
  type: "tipo",
  specialty: "especialidade",
  city: "cidade",
  uf: "uf",
};

function toSearchParams(
  filters: ExploreFilters,
  near: GeoPoint | null,
  radiusKm: number,
): EstabelecimentoSearchParams {
  return {
    termo: filters.term.trim() || undefined,
    tipo: filters.type ? apiTipoByType[filters.type] : undefined,
    especialidade: filters.specialty || undefined,
    cidade: filters.city.trim() || undefined,
    estado: filters.uf || undefined,
    lat: near?.lat,
    lng: near?.lng,
    raioKm: near ? radiusKm : undefined,
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
  initialNear: GeoPoint | null;
  initialRadiusKm: number;
};

export default function HomePage({
  initialFilters,
  initialNear,
  initialRadiusKm,
}: HomePageProps) {
  const router = useRouter();
  const [filters, setFilters] = useState<ExploreFilters>(initialFilters);
  // Visitor position, only set after "Usar minha localização" (RN14).
  const [near, setNear] = useState<GeoPoint | null>(initialNear);
  const [radiusKm, setRadiusKm] = useState(initialRadiusKm);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  const params = useMemo(
    () => toSearchParams(filters, near, radiusKm),
    [filters, near, radiusKm],
  );

  const { items, total, hasMore, isLoading, isLoadingMore, error, loadMore } =
    useUnidadesSearch(params, PAGE_SIZE);
  const { data: especialidades } = useEspecialidades();
  const specialties = useMemo(
    () => (especialidades ?? []).map((especialidade) => especialidade.nome),
    [especialidades],
  );

  const sentinelRef = useInfiniteScroll({
    hasMore,
    loading: isLoading || isLoadingMore,
    onLoadMore: loadMore,
  });

  // Pins are numbered in list order, skipping units without a location.
  const pins = useMemo(() => {
    const list: MapPin[] = [];
    for (const unidade of items) {
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
  }, [items]);

  const markerById = useMemo(
    () => new Map(pins.map((pin) => [pin.id, pin.number])),
    [pins],
  );

  const chips = buildChips(filters);

  useEffect(() => {
    listRef.current?.scrollTo({ top: 0 });
  }, [params]);

  useEffect(() => {
    const query: Record<string, string> = {};
    if (near) {
      query.lat = String(roundCoordinate(near.lat));
      query.lng = String(roundCoordinate(near.lng));
      query.raio = String(radiusKm);
    }
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
  }, [filters, near, radiusKm]);

  // Searches by distance right away, then fills city and state once the
  // coordinates are resolved; on failure the place filters stay as they are.
  async function handleLocate(point: GeoPoint) {
    setNear(point);
    const query = new URLSearchParams({
      lat: String(point.lat),
      lng: String(point.lng),
    });
    try {
      const response = await fetch(`/api/reverse-geocode?${query}`);
      if (response.ok) {
        const place = (await response.json()) as Place;
        setFilters((current) => ({ ...current, ...place }));
      }
    } catch {
      // Keep the search sorted by distance without the place filters.
    }
  }

  function handleClearAll() {
    setFilters(emptyExploreFilters);
    setNear(null);
  }

  // Pins only exist for loaded units, so the card is already in the list.
  function handleSelectPin(id: string) {
    setHighlightedId(id);
    listRef.current
      ?.querySelector<HTMLElement>(`[data-unit-id="${id}"]`)
      ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
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
          onLocate={handleLocate}
          radiusKm={near ? radiusKm : null}
          onRadiusChange={setRadiusKm}
        />
        <div className="explore-main">
          <ExploreSearchBar value={filters} onChange={setFilters} />

          <div className="explore-head">
            <div>
              <h1>
                {isLoading
                  ? "Buscando estabelecimentos…"
                  : total === 1
                    ? "1 estabelecimento encontrado"
                    : `${total} estabelecimentos encontrados`}
              </h1>
              {(chips.length > 0 || near) && (
                <div className="explore-chips">
                  <span>Filtros:</span>
                  {near && (
                    <span className="filter-chip">
                      Perto de você · até {radiusKm} km
                      <button
                        type="button"
                        aria-label="Remover filtro Perto de você"
                        onClick={() => setNear(null)}
                      >
                        ×
                      </button>
                    </span>
                  )}
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
                    onClick={handleClearAll}
                  >
                    Limpar filtros
                  </button>
                </div>
              )}
            </div>
            {/* The API decides the order: by name, or by distance when the
                visitor location is sent. */}
            <span className="explore-order">
              {near ? "Mais próximos de você" : "Em ordem de nome"}
            </span>
          </div>

          <div className="explore-results">
            <div className="explore-list" ref={listRef}>
              {error && items.length === 0 ? (
                <p className="center-note">
                  Não foi possível carregar os estabelecimentos agora. Tente
                  novamente em instantes.
                </p>
              ) : isLoading ? (
                <p className="center-note">Buscando estabelecimentos…</p>
              ) : items.length === 0 ? (
                <p className="center-note">
                  Nenhum estabelecimento encontrado com esses filtros.
                </p>
              ) : (
                <>
                  {items.map((unidade) => (
                    <ExploreUnitItem
                      key={unidade.id}
                      unidade={unidade}
                      marker={markerById.get(unidade.id) ?? null}
                      distanceLabel={
                        near ? formatDistance(unidade.distanceKm) : undefined
                      }
                      highlighted={unidade.id === highlightedId}
                      onHover={setHighlightedId}
                    />
                  ))}
                  {hasMore ? (
                    <div className="explore-loading" ref={sentinelRef}>
                      {isLoadingMore && "Carregando mais estabelecimentos…"}
                    </div>
                  ) : (
                    <p className="explore-end">Você chegou ao fim da lista.</p>
                  )}
                </>
              )}
            </div>
            <ResultsMap
              pins={pins}
              total={items.length}
              origin={near}
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
  const initialNear = parseGeoPoint(query.lat, query.lng);
  const radius = Number(readQuery(query.raio));
  const initialRadiusKm = radiusOptions.includes(radius)
    ? radius
    : defaultRadiusKm;
  const filters: ExploreFilters = {
    term: readQuery(query[queryKeys.term]),
    type: type in unidadeTypeLabels ? (type as UnidadeTipo) : "",
    specialty: readQuery(query[queryKeys.specialty]),
    city: readQuery(query[queryKeys.city]),
    uf: readQuery(query[queryKeys.uf]),
  };
  // Coming from "Usar minha localização" on another page: only coordinates
  // in the URL, so the place filters are filled here.
  if (initialNear && !filters.city && !filters.uf) {
    const place = await reverseGeocode(initialNear);
    if (place) {
      Object.assign(filters, place);
    }
  }
  return {
    props: { initialFilters: filters, initialNear, initialRadiusKm },
  };
};
