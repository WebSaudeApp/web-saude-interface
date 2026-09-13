import { useEffect, useState } from "react";
import Link from "next/link";
import { publicRoutes } from "@/configs/Routes";
import type { Unidade } from "@/types/Entities";

type UnidadeCardProps = {
  unidade: Unidade;
};

const FAVORITES_KEY = "web-saude-favs";

const typeLabels: Record<Unidade["type"], string> = {
  hospital: "Hospital",
  clinica: "Clínica",
  pronto_atendimento: "Pronto atendimento",
};

function readFavorites(): string[] {
  try {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export default function UnidadeCard({ unidade }: UnidadeCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    setIsFavorite(readFavorites().includes(unidade.id));
  }, [unidade.id]);

  function toggleFavorite() {
    const favorites = readFavorites();
    const index = favorites.indexOf(unidade.id);
    if (index >= 0) {
      favorites.splice(index, 1);
    } else {
      favorites.push(unidade.id);
    }
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    setIsFavorite(favorites.includes(unidade.id));
  }

  return (
    <article className="card unit-card">
      <img src={unidade.photos[0]} alt={unidade.name} />
      <div className="unit-card-head">
        <div>
          <div className="unit-type">{typeLabels[unidade.type]}</div>
          <h3>{unidade.name}</h3>
        </div>
        <button
          className={`heart${isFavorite ? " is-on" : ""}`}
          type="button"
          onClick={toggleFavorite}
          aria-label="Favoritar"
        >
          ♥
        </button>
      </div>
      <div className="unit-meta">
        <div>
          {unidade.address.street}
          {unidade.address.number ? `, ${unidade.address.number}` : ""} —{" "}
          {unidade.address.complement ?? unidade.address.city}
        </div>
        <div>
          ★ {unidade.rating.toFixed(1)} ({unidade.reviewCount} avaliações)
        </div>
      </div>
      <Link href={publicRoutes.unitDetails(unidade.id)}>Ver detalhes</Link>
    </article>
  );
}
