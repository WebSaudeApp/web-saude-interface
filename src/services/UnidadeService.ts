import { apiClient } from "@/services/ApiClient";
import type { Unidade } from "@/types/Entities";
import type { SearchRequest, SearchResponse } from "@/types/Search";

export const UnidadeService = {
  search(request: SearchRequest) {
    return apiClient<SearchResponse<Unidade>>("/api/search", {
      query: {
        term: request.term,
        city: request.city,
        page: request.page,
        sort: request.sort,
      },
    });
  },

  getById(id: string) {
    return apiClient<Unidade>(`/api/units/${id}`);
  },

  featured() {
    return apiClient<SearchResponse<Unidade>>("/api/search", {
      query: { featured: 1, page: 1 },
    });
  },
};
