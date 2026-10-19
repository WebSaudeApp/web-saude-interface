import { fromApiEstabelecimento } from "@/lib/estabelecimentoAdapter";
import { apiClient } from "@/services/ApiClient";
import type {
  ApiEspecialidade,
  ApiEstabelecimento,
  ApiPaginada,
} from "@/types/Api";

// Query accepted by GET /estabelecimentos (names as the API expects them).
export type EstabelecimentoSearchParams = {
  termo?: string;
  tipo?: string;
  especialidade?: string;
  cidade?: string;
  estado?: string;
  lat?: number;
  lng?: number;
  raioKm?: number;
};

export const UnidadeService = {
  async search(
    params: EstabelecimentoSearchParams,
    pagina: number,
    limite: number,
  ) {
    const response = await apiClient<ApiPaginada<ApiEstabelecimento>>(
      "/api/search",
      { query: { ...params, pagina, limite } },
    );
    return {
      items: response.dados.map((item) => fromApiEstabelecimento(item)),
      paginacao: response.paginacao,
    };
  },

  async getById(id: string) {
    const item = await apiClient<ApiEstabelecimento>(`/api/units/${id}`);
    return fromApiEstabelecimento(item);
  },

  specialties() {
    return apiClient<ApiEspecialidade[]>("/api/specialties");
  },
};
