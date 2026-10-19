import { ChangeEvent, useMemo, useState } from "react";
import { useRouter } from "next/router";
import UseLocationButton from "@/components/search/UseLocationButton";
import { publicRoutes } from "@/configs/Routes";
import cidades from "@/configs/Cidades";
import { roundCoordinate } from "@/lib/geo";
import type { GeoPoint } from "@/types/Entities";

export default function CitySearchCard() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const suggestions = useMemo(() => {
    const term = query.trim().toLowerCase();
    const filtered = term
      ? cidades.filter((cidade) => cidade.nome.toLowerCase().includes(term))
      : cidades;
    return filtered.slice(0, 3);
  }, [query]);

  function goToCity(nome: string) {
    void router.push({
      pathname: publicRoutes.home,
      query: { cidade: nome },
    });
  }

  function goToLocation({ lat, lng }: GeoPoint) {
    void router.push({
      pathname: publicRoutes.home,
      query: { lat: roundCoordinate(lat), lng: roundCoordinate(lng) },
    });
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    setQuery(event.target.value);
  }

  return (
    <aside className="card city-card">
      <h2>Qual cidade você procura?</h2>
      <p className="help">Mostre opções relevantes na sua região.</p>
      <label className="input-icon">
        <svg viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3-3" />
        </svg>
        <input
          className="input"
          value={query}
          onChange={handleInputChange}
          placeholder="Digite a cidade..."
        />
      </label>
      <div className="suggest">
        {suggestions.map((cidade) => (
          <button
            key={cidade.nome}
            type="button"
            onClick={() => goToCity(cidade.nome)}
          >
            📍 {cidade.nome}, {cidade.uf}
          </button>
        ))}
      </div>
      <UseLocationButton
        className="btn btn-primary btn-lg"
        onLocate={goToLocation}
      />
      <p className="help help-popular">Cidades populares</p>
      <div className="popular">
        {cidades.map((cidade) => (
          <button
            key={cidade.nome}
            type="button"
            onClick={() => goToCity(cidade.nome)}
          >
            {cidade.nome} ({cidade.uf})
          </button>
        ))}
      </div>
    </aside>
  );
}
