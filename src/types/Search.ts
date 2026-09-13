export type SortOption = {
  name: string;
  field: string;
  direction: "asc" | "desc";
};

export type FacetConfig = {
  field: string;
  type: "value" | "range";
};

export type SearchFieldConfig = {
  weight?: number;
};

export type ResultFieldConfig = {
  raw?: boolean;
  snippet?: boolean;
};

export type SearchQueryConfig = {
  index: string;
  operator: "AND" | "OR";
  searchFields: Record<string, SearchFieldConfig>;
  resultFields: Record<string, ResultFieldConfig>;
  facets: Record<string, FacetConfig>;
  sortOptions: SortOption[];
  resultsPerPage: number;
};

export type SearchFilters = Record<string, string | string[] | undefined>;

export type SearchRequest = {
  term?: string;
  city?: string;
  page?: number;
  filters?: SearchFilters;
  sort?: string;
};

export type SearchResponse<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};
