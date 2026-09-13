import type { SearchQueryConfig } from "@/types/Search";

const config: SearchQueryConfig = {
  index: "unidades",
  operator: "AND",
  searchFields: {
    name: { weight: 3 },
    specialties: { weight: 2 },
    "address.city": { weight: 1 },
  },
  resultFields: {
    name: { raw: true },
    type: { raw: true },
    address: { raw: true },
    rating: { raw: true },
    reviewCount: { raw: true },
    photos: { raw: true },
    specialties: { raw: true },
    openNow: { raw: true },
  },
  facets: {
    type: { field: "type", type: "value" },
    specialties: { field: "specialties", type: "value" },
    rating: { field: "rating", type: "range" },
    openNow: { field: "openNow", type: "value" },
  },
  sortOptions: [
    { name: "Relevância", field: "_score", direction: "desc" },
    { name: "Avaliação", field: "rating", direction: "desc" },
    { name: "Recentes", field: "createdAt", direction: "desc" },
  ],
  resultsPerPage: 6,
};

const Unidades = {
  config,
};

export default Unidades;
