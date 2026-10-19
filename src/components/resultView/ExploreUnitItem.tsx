import Link from "next/link";
import { publicRoutes } from "@/configs/Routes";
import { unidadeTypeLabels } from "@/configs/DisplayFields";
import type { Unidade } from "@/types/Entities";

const MAX_SPECIALTIES = 3;

type ExploreUnitItemProps = {
  unidade: Unidade;
  // Pin number shown on the map; null when the unit has no location.
  marker: number | null;
  // Distance from the visitor, when they shared their location.
  distanceLabel?: string;
  highlighted: boolean;
  onHover: (id: string | null) => void;
};

function formatAddress(unidade: Unidade) {
  const { street, number, complement, city, state } = unidade.address;
  return [
    number ? `${street}, ${number}` : street,
    complement,
    `${city} – ${state}`,
  ]
    .filter(Boolean)
    .join(" · ");
}

export default function ExploreUnitItem({
  unidade,
  marker,
  distanceLabel,
  highlighted,
  onHover,
}: ExploreUnitItemProps) {
  const extraSpecialties = unidade.specialties.length - MAX_SPECIALTIES;

  return (
    <article
      className={`card explore-item${highlighted ? " is-highlighted" : ""}`}
      data-unit-id={unidade.id}
      onMouseEnter={() => onHover(unidade.id)}
      onMouseLeave={() => onHover(null)}
    >
      <div className="explore-item-thumb">
        {unidade.photos[0] ? (
          <img src={unidade.photos[0]} alt={unidade.name} />
        ) : (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 21V9l8-5 8 5v12M9 21v-6h6v6M12 8v4M10 10h4" />
          </svg>
        )}
      </div>
      <div className="explore-item-body">
        <div className="explore-item-top">
          {marker !== null && <span className="map-marker">{marker}</span>}
          <span className="unit-type explore-item-type">
            {unidadeTypeLabels[unidade.type]}
          </span>
          {marker === null && (
            <span className="chip explore-no-location">
              Sem localização no mapa
            </span>
          )}
        </div>
        <h3>{unidade.name}</h3>
        <p className="explore-item-address">{formatAddress(unidade)}</p>
        <div className="explore-item-chips">
          {unidade.specialties.slice(0, MAX_SPECIALTIES).map((specialty) => (
            <span className="chip" key={specialty}>
              {specialty}
            </span>
          ))}
          {extraSpecialties > 0 && (
            <span className="chip">+{extraSpecialties}</span>
          )}
        </div>
        <div className="explore-item-info">
          {distanceLabel && (
            <b className="explore-item-distance">a {distanceLabel}</b>
          )}
          {unidade.open24h ? (
            <b className="explore-item-24h">Atende 24 horas</b>
          ) : (
            <span>{unidade.scheduleLabel}</span>
          )}
          {unidade.phone && <span>{unidade.phone}</span>}
        </div>
      </div>
      <div className="explore-item-actions">
        <Link
          className="btn btn-primary"
          href={publicRoutes.unitDetails(unidade.id)}
        >
          Ver detalhes
        </Link>
        <Link
          className="btn btn-outline"
          href={`${publicRoutes.unitDetails(unidade.id)}#avaliacoes`}
        >
          Ver avaliações
        </Link>
      </div>
    </article>
  );
}
