import Link from "next/link";
import { publicRoutes } from "@/configs/Routes";
import { unidadeTypeLabels } from "@/configs/DisplayFields";
import { useFavorite } from "@/hooks/useFavorite";
import type { Unidade } from "@/types/Entities";

type UnidadeRowProps = {
  unidade: Unidade;
  onFavoriteChange?: (isFavorite: boolean) => void;
};

export default function UnidadeRow({
  unidade,
  onFavoriteChange,
}: UnidadeRowProps) {
  const [isFavorite, toggleFavorite] = useFavorite(unidade.id);

  function handleToggleFavorite() {
    toggleFavorite();
    onFavoriteChange?.(!isFavorite);
  }

  return (
    <article className="card unit-row">
      <img src={unidade.photos[0]} alt={unidade.name} />
      <div>
        <div className="unit-row-top">
          <span className="unit-type">{unidadeTypeLabels[unidade.type]}</span>
          <span>{unidade.distanceKm.toFixed(1).replace(".", ",")} km</span>
        </div>
        <h3>{unidade.name}</h3>
        <div className="unit-meta">
          <div>
            ★ {unidade.rating.toFixed(1)} ({unidade.reviewCount} avaliações) ·{" "}
            {unidade.scheduleLabel}
          </div>
          <div>
            {unidade.address.street}
            {unidade.address.number ? `, ${unidade.address.number}` : ""} —{" "}
            {unidade.address.complement ?? unidade.address.city}
          </div>
        </div>
        <div className="unit-row-chips">
          {unidade.insurances.map((insurance) => (
            <span className="chip" key={insurance}>
              {insurance}
            </span>
          ))}
        </div>
      </div>
      <div className="unit-row-actions">
        <button
          className={`heart${isFavorite ? " is-on" : ""}`}
          type="button"
          onClick={handleToggleFavorite}
          aria-label="Favoritar"
        >
          ♥
        </button>
        <Link href={publicRoutes.unitDetails(unidade.id)}>Ver detalhes →</Link>
      </div>
    </article>
  );
}
