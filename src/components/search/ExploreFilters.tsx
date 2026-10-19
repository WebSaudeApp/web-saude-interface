import { useEffect, useState, type FormEvent } from "react";
import { unidadeTypeLabels } from "@/configs/DisplayFields";
import UseLocationButton from "@/components/search/UseLocationButton";
import estados from "@/configs/Estados";
import type { GeoPoint, UnidadeTipo } from "@/types/Entities";

export type ExploreFilters = {
  term: string;
  type: UnidadeTipo | "";
  specialty: string;
  city: string;
  uf: string;
};

export const emptyExploreFilters: ExploreFilters = {
  term: "",
  type: "",
  specialty: "",
  city: "",
  uf: "",
};

type FiltersProps = {
  value: ExploreFilters;
  onChange: (next: ExploreFilters) => void;
};

type ExploreFiltersPanelProps = FiltersProps & {
  specialties: string[];
  onLocate: (point: GeoPoint) => void;
};

// Collapsible vertical panel with the selection filters, applied as they
// change. The free-text search lives in ExploreSearchBar.
export function ExploreFiltersPanel({
  value,
  specialties,
  onChange,
  onLocate,
}: ExploreFiltersPanelProps) {
  function update<K extends keyof ExploreFilters>(
    key: K,
    next: ExploreFilters[K],
  ) {
    onChange({ ...value, [key]: next });
  }

  const [open, setOpen] = useState(true);
  const selectedCount = [value.type, value.specialty, value.city, value.uf]
    .map((field) => field.trim())
    .filter(Boolean).length;

  if (!open) {
    return (
      <button
        type="button"
        className="btn btn-ghost explore-filters-toggle"
        aria-expanded={false}
        onClick={() => setOpen(true)}
      >
        Filtrar +
        {selectedCount > 0 && (
          <span className="explore-filters-count">{selectedCount}</span>
        )}
      </button>
    );
  }

  return (
    <aside className="card explore-filters">
      <div className="explore-filters-head">
        <h2>Filtros</h2>
        <button
          type="button"
          className="explore-filters-close"
          aria-expanded={true}
          aria-label="Fechar filtros"
          onClick={() => setOpen(false)}
        >
          −
        </button>
      </div>
      <label className="field">
        <span>Tipo</span>
        <select
          className="select"
          value={value.type}
          onChange={(event) =>
            update("type", event.target.value as UnidadeTipo | "")
          }
        >
          <option value="">Todos</option>
          {Object.entries(unidadeTypeLabels).map(([type, label]) => (
            <option key={type} value={type}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>Especialidade</span>
        <select
          className="select"
          value={value.specialty}
          onChange={(event) => update("specialty", event.target.value)}
        >
          <option value="">Todas</option>
          {specialties.map((specialty) => (
            <option key={specialty} value={specialty}>
              {specialty}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>Cidade</span>
        <input
          className="input"
          value={value.city}
          onChange={(event) => update("city", event.target.value)}
          placeholder="Qualquer cidade"
        />
      </label>
      <label className="field">
        <span>Estado</span>
        <select
          className="select"
          value={value.uf}
          onChange={(event) => update("uf", event.target.value)}
        >
          <option value="">Todos</option>
          {estados.map((uf) => (
            <option key={uf} value={uf}>
              {uf}
            </option>
          ))}
        </select>
      </label>
      <UseLocationButton className="btn btn-outline" onLocate={onLocate} />
      <button
        type="button"
        className="btn btn-ghost"
        disabled={selectedCount === 0}
        onClick={() => onChange({ ...emptyExploreFilters, term: value.term })}
      >
        Limpar seleção
      </button>
    </aside>
  );
}

// Unlike the selection filters, the typed term only applies on "Buscar"
// (or Enter); until then it is a local draft.
export function ExploreSearchBar({ value, onChange }: FiltersProps) {
  const [draft, setDraft] = useState(value.term);

  // Follows term changes made elsewhere, like removing its chip or
  // "Limpar filtros".
  useEffect(() => {
    setDraft(value.term);
  }, [value.term]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onChange({ ...value, term: draft });
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }

  return (
    <form className="card explore-search" onSubmit={handleSubmit}>
      <label className="input-icon">
        <svg viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3-3" />
        </svg>
        <input
          className="input"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="O que você procura? Nome ou especialidade"
          aria-label="O que você procura"
        />
      </label>
      <button className="btn btn-primary explore-search-submit" type="submit">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3-3" />
        </svg>
        Buscar
      </button>
    </form>
  );
}
