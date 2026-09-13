import useSWR from "swr";
import { UnidadeService } from "@/services/UnidadeService";
import type { SearchRequest } from "@/types/Search";

export function useUnidades(request: SearchRequest) {
  return useSWR(["unidades", request], () => UnidadeService.search(request));
}

export function useUnidade(id?: string) {
  return useSWR(id ? ["unidade", id] : null, () => UnidadeService.getById(id!));
}

export function useUnidadesDestaque() {
  return useSWR("unidades-destaque", () => UnidadeService.featured());
}
