import Link from "next/link";
import { publicRoutes } from "@/configs/Routes";
import { unidadeTypeLabels } from "@/configs/DisplayFields";
import { useFavorite } from "@/hooks/useFavorite";
import type { Unidade } from "@/types/Entities";

type UnidadeCardProps = {
  unidade: Unidade;
};

export default function UnidadeCard({ unidade }: UnidadeCardProps) {
  const [isFavorite, toggleFavorite] = useFavorite(unidade.id);

  return (
    <article className="card unit-card">
      <img src={unidade.photos[0]} alt={unidade.name} />
      <div className="unit-card-head">
        <div>
          <div className="unit-type">{unidadeTypeLabels[unidade.type]}</div>
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
