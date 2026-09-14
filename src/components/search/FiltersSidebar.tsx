import { useState } from "react";

export type Filters = {
  openNow: boolean;
  hasInsurance: boolean;
  open24h: boolean;
  minRating: number;
};

const emptyFilters: Filters = {
  openNow: false,
  hasInsurance: false,
  open24h: false,
  minRating: 0,
};

type FiltersSidebarProps = {
  initialFilters: Filters;
  onApply: (filters: Filters) => void;
};

export default function FiltersSidebar({
  initialFilters,
  onApply,
}: FiltersSidebarProps) {
  const [draft, setDraft] = useState<Filters>(initialFilters);

  function handleClear() {
    setDraft(emptyFilters);
    onApply(emptyFilters);
  }

  return (
    <aside className="card filters">
      <h3>
        Filtros avançados
        <button type="button" onClick={handleClear}>
          Limpar
        </button>
      </h3>
      <label className="check">
        <input
          type="checkbox"
          checked={draft.openNow}
          onChange={(event) =>
            setDraft({ ...draft, openNow: event.target.checked })
          }
        />
        Aberto agora
      </label>
      <label className="check">
        <input
          type="checkbox"
          checked={draft.hasInsurance}
          onChange={(event) =>
            setDraft({ ...draft, hasInsurance: event.target.checked })
          }
        />
        Atende convênio
      </label>
      <label className="check">
        <input
          type="checkbox"
          checked={draft.open24h}
          onChange={(event) =>
            setDraft({ ...draft, open24h: event.target.checked })
          }
        />
        Urgência 24h
      </label>
      <div className="filter-group">
        <span className="label">Avaliação mínima</span>
        <select
          className="select"
          value={draft.minRating}
          onChange={(event) =>
            setDraft({ ...draft, minRating: Number(event.target.value) })
          }
        >
          <option value={0}>Todas</option>
          <option value={4}>4+ estrelas</option>
          <option value={4.5}>4,5+ estrelas</option>
        </select>
      </div>
      <button
        className="btn btn-primary btn-lg"
        type="button"
        onClick={() => onApply(draft)}
      >
        Aplicar filtros
      </button>
    </aside>
  );
}
