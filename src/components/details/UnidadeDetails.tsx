import { useState } from "react";
import { useRouter } from "next/router";
import avaliacoesMock from "@/configs/Avaliacoes";
import { unidadeTypeLabels } from "@/configs/DisplayFields";
import { publicRoutes } from "@/configs/Routes";
import { useAuth } from "@/hooks/useAuth";
import { useFavorite } from "@/hooks/useFavorite";
import { getInitials } from "@/lib/initials";
import { alertService } from "@/services/AlertService";
import type { Unidade } from "@/types/Entities";

type UnidadeDetailsProps = {
  unidade: Unidade;
};

function formatDate(value: string) {
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

function stars(rating: number) {
  return "★".repeat(rating) + "☆".repeat(5 - rating);
}

export default function UnidadeDetails({ unidade }: UnidadeDetailsProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [isFavorite, toggleFavorite] = useFavorite(unidade.id);
  const [activePhoto, setActivePhoto] = useState(unidade.photos[0]);

  function handleFavorite() {
    if (!user) {
      router.push(publicRoutes.login);
      return;
    }
    toggleFavorite();
  }

  function handleReview() {
    if (!user) {
      router.push(publicRoutes.login);
      return;
    }
    alertService.info("Envio de avaliação em breve.");
  }

  function handleShare() {
    navigator.clipboard.writeText(window.location.href);
    alertService.success("Link copiado.");
  }

  return (
    <div className="details">
      <div className="details-title">
        <h1>{unidade.name}</h1>
        <span className="chip">{unidadeTypeLabels[unidade.type]}</span>
        <span className="chip chip-ok">
          {unidade.openNow ? "Aberto agora" : unidade.scheduleLabel}
        </span>
        <button
          className={`btn btn-ghost${isFavorite ? " is-fav" : ""}`}
          type="button"
          onClick={handleFavorite}
        >
          ♥ {isFavorite ? "Favoritado" : "Favoritar"}
        </button>
        <button className="btn btn-ghost" type="button" onClick={handleShare}>
          Compartilhar
        </button>
      </div>

      <div className="gallery">
        <div>
          <img className="gallery-main" src={activePhoto} alt={unidade.name} />
          <div className="thumbs">
            {unidade.photos.map((photo, index) => (
              <img
                key={`${photo}-${index}`}
                src={photo}
                alt=""
                className={photo === activePhoto ? "is-on" : undefined}
                onClick={() => setActivePhoto(photo)}
              />
            ))}
          </div>
        </div>
        <div className="info-grid">
          <div className="card info-card">
            <div>
              {unidade.address.street}
              {unidade.address.number
                ? `, ${unidade.address.number}`
                : ""} — {unidade.address.complement ?? unidade.address.city},{" "}
              {unidade.address.city}
            </div>
            {unidade.phone ? <div>☎ {unidade.phone}</div> : null}
            {unidade.email ? <div>✉ {unidade.email}</div> : null}
          </div>
          <div className="card info-card">
            <b>Especialidades</b>
            <div className="spec-grid">
              {unidade.specialties.map((specialty) => (
                <span className="chip" key={specialty}>
                  {specialty}
                </span>
              ))}
            </div>
          </div>
          <div className="card info-card">
            <b>Horários</b>
            <div>{unidade.scheduleLabel}</div>
          </div>
        </div>
      </div>

      <section className="card info-card">
        <div className="reviews-summary">
          <div>
            <b>Avaliações</b>
            <div className="reviews-score">{unidade.rating.toFixed(1)}</div>
            <div>{unidade.reviewCount} avaliações</div>
          </div>
          <button
            className="btn btn-primary"
            type="button"
            onClick={handleReview}
          >
            Deixar avaliação
          </button>
        </div>
        {avaliacoesMock.map((avaliacao) => (
          <article className="review" key={avaliacao.id}>
            <div className="avatar avatar-initials" aria-hidden="true">
              {getInitials(avaliacao.authorName)}
            </div>
            <div>
              <b>{avaliacao.authorName}</b>
              <div>{stars(avaliacao.rating)}</div>
              <p>{avaliacao.comment}</p>
            </div>
            <span>{formatDate(avaliacao.createdAt)}</span>
          </article>
        ))}
      </section>
    </div>
  );
}
