import { useMemo } from "react";
import useSWR from "swr";
import useSWRInfinite from "swr/infinite";
import {
  UnidadeService,
  type EstabelecimentoSearchParams,
} from "@/services/UnidadeService";

/**
 * Paged search for the infinite scroll: each page comes from the API
 * (`pagina`/`limite`) and `loadMore` asks for the next one while the API
 * says `temMais`. Changing `params` starts again from the first page.
 */
export function useUnidadesSearch(
  params: EstabelecimentoSearchParams,
  pageSize: number,
) {
  const key = JSON.stringify(params);
  const { data, error, size, setSize, isLoading, isValidating } =
    useSWRInfinite(
      (index, previous: { paginacao: { temMais: boolean } } | null) =>
        previous && !previous.paginacao.temMais
          ? null
          : ["unidades", key, index + 1],
      ([, , pagina]) =>
        UnidadeService.search(params, pagina as number, pageSize),
      {
        revalidateFirstPage: false,
        revalidateOnFocus: false,
        // A failure waits for the visitor's "Tentar novamente" instead of
        // retrying on its own, which would hammer an API that is struggling.
        shouldRetryOnError: false,
      },
    );

  // Stable while the pages do not change, so effects keyed on the list
  // (like the map markers) do not re-run on every render.
  const items = useMemo(
    () => data?.flatMap((page) => page.items) ?? [],
    [data],
  );
  const last = data?.[data.length - 1];
  const isLoadingMore =
    isValidating && data !== undefined && size > data.length;
  // The first page worked but a later one did not: keep what is on screen.
  const loadMoreFailed = Boolean(error) && data !== undefined;

  return {
    items,
    total: data?.[0]?.paginacao.total ?? 0,
    hasMore: last?.paginacao.temMais ?? false,
    isLoading,
    isLoadingMore,
    error,
    loadMoreFailed,
    isRetrying: Boolean(error) && isValidating,
    loadMore: () => setSize(size + 1),
    // Asks only for the page that is missing; a bare `mutate()` would fetch
    // every loaded page again.
    retry: () => void setSize(size),
  };
}

export function useUnidade(id?: string) {
  return useSWR(id ? ["unidade", id] : null, () => UnidadeService.getById(id!));
}

export function useEspecialidades() {
  return useSWR("especialidades", () => UnidadeService.specialties(), {
    revalidateOnFocus: false,
  });
}
