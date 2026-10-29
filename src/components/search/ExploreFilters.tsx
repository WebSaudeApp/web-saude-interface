import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import Select, { type SelectOption } from "@/components/common/Select";
import UseLocationButton from "@/components/search/UseLocationButton";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { unidadeTypeLabels } from "@/configs/DisplayFields";
import estados from "@/configs/Estados";
import type { GeoPoint, UnidadeTipo } from "@/types/Entities";

export type ExploreFilters = {
  term: string;
  type: UnidadeTipo | "";
  specialty: string;
  city: string;
  uf: string;
};

// The API only stores these types (RN05), so "Pronto atendimento" is not
// offered in the search.
const searchableTypes: UnidadeTipo[] = ["hospital", "clinica"];

const typeOptions: SelectOption[] = [
  { value: "", label: "Todos" },
  ...searchableTypes.map((type) => ({
    value: type,
    label: unidadeTypeLabels[type],
  })),
];

const ufOptions: SelectOption[] = [
  { value: "", label: "Todos" },
  ...estados.map((uf) => ({ value: uf, label: uf })),
];

// The search form lives in its own card on desktop; on phones its "Buscar"
// button sits at the end of the filters, outside the form, and submits it
// through this id.
const SEARCH_FORM_ID = "explore-search-form";

// Same breakpoint as the mobile layout in globals.scss.
const MOBILE_QUERY = "(max-width: 860px)";

// Radius options for the location search; the API accepts 1 to 50 km.
export const radiusOptions = [5, 10, 25, 50];
export const defaultRadiusKm = 10;

const radiusSelectOptions: SelectOption[] = radiusOptions.map((km) => ({
  value: String(km),
  label: `Até ${km} km`,
}));

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

type ExploreFilterBarProps = FiltersProps & {
  specialties: string[];
  onLocate: (point: GeoPoint) => void;
  // Only set while the visitor location is in use.
  radiusKm: number | null;
  onRadiusChange: (radiusKm: number) => void;
  // Clears the selects and the location, keeping the typed term.
  onClear: () => void;
};

// Horizontal bar with the selection filters, applied as they change. The
// free-text search lives in ExploreSearchBar.
export function ExploreFilterBar({
  value,
  specialties,
  onChange,
  onLocate,
  radiusKm,
  onRadiusChange,
  onClear,
}: ExploreFilterBarProps) {
  const cityId = useId();
  // The API matches the city by its full name, so the typed text only
  // applies on Enter or when leaving the field, not on every keystroke.
  const [cityDraft, setCityDraft] = useState(value.city);
  const cityRef = useRef<HTMLInputElement | null>(null);
  // Phones submit with the keyboard "Ir" key, and the narrow field has no
  // room for the "+ Enter" hint.
  const isMobile = useMediaQuery(MOBILE_QUERY);

  useEffect(() => {
    setCityDraft(value.city);
  }, [value.city]);

  function update<K extends keyof ExploreFilters>(
    key: K,
    next: ExploreFilters[K],
  ) {
    onChange({ ...value, [key]: next });
  }

  function commitCity() {
    if (cityDraft.trim() !== value.city.trim()) {
      update("city", cityDraft.trim());
    }
  }

  const specialtyOptions: SelectOption[] = [
    { value: "", label: "Todas" },
    ...specialties.map((specialty) => ({
      value: specialty,
      label: specialty,
    })),
  ];

  const hasSelection =
    Boolean(value.type || value.specialty || value.uf) ||
    value.city.trim() !== "" ||
    radiusKm !== null;

  return (
    <div className="card explore-filterbar">
      <div className="bar-field bar-type">
        <span className="bar-label">Tipo</span>
        <Select
          ariaLabel="Tipo"
          value={value.type}
          options={typeOptions}
          onChange={(next) => update("type", next as UnidadeTipo | "")}
        />
      </div>
      <div className="bar-field bar-specialty">
        <span className="bar-label">Especialidade</span>
        <Select
          ariaLabel="Especialidade"
          value={value.specialty}
          options={specialtyOptions}
          onChange={(next) => update("specialty", next)}
        />
      </div>
      <div className="bar-field bar-city">
        <label className="bar-label" htmlFor={cityId}>
          Cidade
        </label>
        <input
          id={cityId}
          className="bar-input"
          ref={cityRef}
          value={cityDraft}
          onChange={(event) => setCityDraft(event.target.value)}
          onBlur={commitCity}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              commitCity();
            }
          }}
          placeholder={isMobile ? "Nome da cidade" : "Nome da cidade + Enter"}
        />
      </div>
      <div className="bar-field bar-uf">
        <span className="bar-label">Estado</span>
        <Select
          ariaLabel="Estado"
          value={value.uf}
          options={ufOptions}
          onChange={(next) => update("uf", next)}
        />
      </div>
      <div className="bar-field bar-location">
        <span className="bar-label">Localização</span>
        <UseLocationButton
          compact
          className="bar-location-button"
          onLocate={onLocate}
          onError={() => cityRef.current?.focus()}
        />
      </div>
      {radiusKm !== null && (
        <div className="bar-field bar-radius">
          <span className="bar-label">Distância máxima</span>
          <Select
            ariaLabel="Distância máxima"
            value={String(radiusKm)}
            options={radiusSelectOptions}
            onChange={(next) => onRadiusChange(Number(next))}
          />
        </div>
      )}
      <button className="bar-submit" type="submit" form={SEARCH_FORM_ID}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.5-3.5" />
        </svg>
        Buscar
      </button>
      <button
        type="button"
        className="bar-clear"
        disabled={!hasSelection}
        onClick={onClear}
      >
        Limpar seleção
      </button>
    </div>
  );
}

// Unlike the selection filters, the typed term only applies on "Buscar"
// (or Enter); until then it is a local draft.
export function ExploreSearchBar({ value, onChange }: FiltersProps) {
  const inputId = useId();
  const [draft, setDraft] = useState(value.term);

  // Follows term changes made elsewhere, like "Limpar seleção" on the
  // empty-results screen.
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
    <form
      id={SEARCH_FORM_ID}
      className="card explore-searchcard"
      onSubmit={handleSubmit}
    >
      <div className="bar-field">
        <label className="bar-label" htmlFor={inputId}>
          O que você procura
        </label>
        <div className="search-row">
          <span className="search-input">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3.5-3.5" />
            </svg>
            <input
              id={inputId}
              className="bar-input"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Nome ou especialidade"
            />
          </span>
          <button className="search-submit" type="submit">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3.5-3.5" />
            </svg>
            Buscar
          </button>
        </div>
      </div>
    </form>
  );
}
