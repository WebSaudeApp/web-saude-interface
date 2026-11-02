import { useEffect, useMemo, useRef, useState } from "react";
import type { GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import ExploreUnitItem from "@/components/resultView/ExploreUnitItem";
import ResultsMap, { type MapPin } from "@/components/resultView/ResultsMap";
import {
  defaultRadiusKm,
  emptyExploreFilters,
  ExploreFilterBar,
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
import { fetchIpPlace } from "@/services/LocationService";
import type { EstabelecimentoSearchParams } from "@/services/UnidadeService";
import type { GeoPoint, UnidadeTipo } from "@/types/Entities";

const howSteps = [
  {
    title: "Informe o que procura",
    text: "Use o termo, o tipo, a especialidade, a cidade ou o estado. Tudo é opcional.",
  },
  {
    title: "Veja a lista e o mapa",
    text: "Os resultados vêm em ordem de nome, e quem tem localização cadastrada aparece no mapa.",
  },
  {
    title: "Abra os detalhes",
    text: "Endereço, contatos, horários, fotos e avaliações de quem já foi atendido.",
  },
];

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
  // Set once the visitor picks a place or location, so a slow suggestion
  // never overrides it.
  const placeChosen = useRef(false);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  const params = useMemo(
    () => toSearchParams(filters, near, radiusKm),
    [filters, near, radiusKm],
  );

  const {
    items,
    total,
    hasMore,
    isLoading,
    isLoadingMore,
    error,
    loadMoreFailed,
    loadMore,
    retry,
  } = useUnidadesSearch(params, PAGE_SIZE);
  const { data: especialidades } = useEspecialidades();
  const specialties = useMemo(
    () => (especialidades ?? []).map((especialidade) => especialidade.nome),
    [especialidades],
  );

  const sentinelRef = useInfiniteScroll({
    hasMore,
    // Stops asking for pages after a failure; the retry button resumes.
    loading: isLoading || isLoadingMore || loadMoreFailed,
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

  // First visit without a place in the URL: start from the approximate city
  // and state of the connection (FE-03). No coordinates, so the list is not
  // sorted by distance, and nothing is asked of the visitor.
  useEffect(() => {
    if (initialFilters.city.trim() || initialFilters.uf || initialNear) {
      return;
    }
    let cancelled = false;
    void fetchIpPlace().then((place) => {
      if (cancelled || !place || placeChosen.current) {
        return;
      }
      setFilters((current) => ({ ...current, city: place.city, uf: place.uf }));
    });
    return () => {
      cancelled = true;
    };
    // Only on arrival; later filter changes belong to the visitor.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Searches by distance right away, then fills city and state once the
  // coordinates are resolved; on failure the place filters stay as they are.
  async function handleLocate(point: GeoPoint) {
    placeChosen.current = true;
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

  // "Limpar seleção" in the filter bar: the selects and the location go, the
  // typed term stays.
  function handleClearSelection() {
    placeChosen.current = true;
    setFilters((current) => ({ ...emptyExploreFilters, term: current.term }));
    setNear(null);
  }

  // Any change the visitor makes to the filters is theirs to keep.
  function handleFiltersChange(next: ExploreFilters) {
    placeChosen.current = true;
    setFilters(next);
  }

  // On the empty-results screen the term may be what hides everything.
  function handleClearAll() {
    placeChosen.current = true;
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

  const showError = Boolean(error) && !loadMoreFailed;
  const showEmpty = !showError && !isLoading && items.length === 0;
  const centered = showError || showEmpty || isLoading;

  let title: string;
  if (isLoading) {
    title = "Buscando estabelecimentos…";
  } else if (showError) {
    title = "Não foi possível carregar";
  } else if (total === 0) {
    title = "Nenhum estabelecimento encontrado";
  } else if (total === 1) {
    title = "1 estabelecimento encontrado";
  } else {
    title = `${total} estabelecimentos encontrados`;
  }

  return (
    <>
      <Head>
        <title>Web Saúde</title>
      </Head>
      <div className="explore">
        <div className="explore-top">
          <ExploreFilterBar
            value={filters}
            specialties={specialties}
            onChange={handleFiltersChange}
            onLocate={handleLocate}
            radiusKm={near ? radiusKm : null}
            onRadiusChange={setRadiusKm}
            onClear={handleClearSelection}
          />
          <ExploreSearchBar value={filters} onChange={setFilters} />
        </div>

        <div className="explore-results">
          <section className="explore-panel">
            <header className="explore-panel-head">
              <h1>{title}</h1>
              {/* The API decides the order: by name, or by distance when the
                  visitor location is sent. */}
              <p>
                {near
                  ? `Mais próximos de você · até ${radiusKm} km`
                  : "Em ordem de nome"}
              </p>
            </header>
            <div
              className={`explore-list${centered ? " is-centered" : ""}`}
              ref={listRef}
            >
              {showError ? (
                <div className="explore-empty" role="alert">
                  <p>
                    Não foi possível carregar os estabelecimentos agora. Tente
                    novamente em instantes.
                  </p>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={retry}
                  >
                    Tentar novamente
                  </button>
                </div>
              ) : isLoading ? (
                <p className="center-note">Buscando estabelecimentos…</p>
              ) : showEmpty ? (
                <div className="explore-empty">
                  <span className="explore-empty-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24">
                      <circle cx="11" cy="11" r="7" />
                      <path d="M20 20l-3.5-3.5M8 11h6" />
                    </svg>
                  </span>
                  <h2>Tente ajustar a busca</h2>
                  <p>
                    Remova algum filtro ou busque por outro termo para ver mais
                    estabelecimentos.
                  </p>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleClearAll}
                  >
                    Limpar seleção
                  </button>
                </div>
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
                  {loadMoreFailed ? (
                    <div className="explore-loadmore-error" role="alert">
                      <span>
                        Não foi possível carregar mais estabelecimentos.
                      </span>
                      <button
                        type="button"
                        className="btn btn-outline"
                        onClick={retry}
                      >
                        Tentar novamente
                      </button>
                    </div>
                  ) : hasMore ? (
                    <div className="explore-loading" ref={sentinelRef}>
                      {isLoadingMore && "Carregando mais estabelecimentos…"}
                    </div>
                  ) : (
                    <p className="explore-end">Você chegou ao fim da lista.</p>
                  )}
                </>
              )}
            </div>
          </section>
          {/* On phones this slot sticks under the header while the filters
              and the list scroll beneath it. */}
          <div className="explore-map-slot">
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

      <section className="how-home" aria-labelledby="how-title">
        <h2 id="how-title">Como funciona</h2>
        <ol className="how-grid">
          {howSteps.map((step, index) => (
            <li key={step.title}>
              <span className="how-num" aria-hidden="true">
                {index + 1}
              </span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
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
