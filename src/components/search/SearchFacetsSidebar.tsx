import Unidades from "@/configs/Unidades";

export default function SearchFacetsSidebar() {
  return (
    <aside className="card">
      <h2>Filtros</h2>
      <ul>
        {Object.keys(Unidades.config.facets).map((facet) => (
          <li key={facet}>{facet}</li>
        ))}
      </ul>
    </aside>
  );
}
