import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import avaliacoesMock from "@/configs/Avaliacoes";
import { unidadeTypeLabels } from "@/configs/DisplayFields";
import { publicRoutes } from "@/configs/Routes";
import { useAuth } from "@/hooks/useAuth";
import { useFavorite } from "@/hooks/useFavorite";
import { formatDate } from "@/lib/date";
import { formatStars } from "@/lib/stars";
import { alertService } from "@/services/AlertService";
import type { Unidade } from "@/types/Entities";

type UnidadeDetailsProps = {
  unidade: Unidade;
};

const defaultUnitPhoto =
  "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=800&q=80";

const defaultAvaliacoes = [
  {
    id: "1",
    authorName: "Maria Silva",
    authorAvatarUrl: "https://i.pravatar.cc/80?img=47",
    rating: 5,
    comment: "Excelente atendimento e estrutura moderna.",
    createdAt: "2023-10-10",
  },
  {
    id: "2",
    authorName: "João Santos",
    authorAvatarUrl: "https://i.pravatar.cc/80?img=12",
    rating: 5,
    comment: "Ótima equipe médica, recomendo muito.",
    createdAt: "2023-10-08",
  },
  {
    id: "3",
    authorName: "Ana Lima",
    authorAvatarUrl: "https://i.pravatar.cc/80?img=32",
    rating: 4,
    comment: "Atendimento rápido e equipe atenciosa.",
    createdAt: "2023-10-02",
  },
  {
    id: "4",
    authorName: "Pedro Alves",
    authorAvatarUrl: "https://i.pravatar.cc/80?img=15",
    rating: 5,
    comment: "Consultório limpo e horário certo.",
    createdAt: "2026-10-26",
  },
  {
    id: "5",
    authorName: "Carla Nunes",
    authorAvatarUrl: "https://i.pravatar.cc/80?img=24",
    rating: 3,
    comment: "Demorou para atender no telefone.",
    createdAt: "2026-10-22",
  },
];

export default function UnidadeDetails({ unidade }: UnidadeDetailsProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [isFavorite, toggleFavorite] = useFavorite(unidade.id);

  const fotos =
    unidade.photos && unidade.photos.length > 0
      ? unidade.photos
      : [defaultUnitPhoto];

  const [activePhoto, setActivePhoto] = useState<string>(fotos[0]);

  useEffect(() => {
    const list =
      unidade.photos && unidade.photos.length > 0
        ? unidade.photos
        : [defaultUnitPhoto];
    setActivePhoto(list[0]);
  }, [unidade.id, unidade.photos]);

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
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(window.location.href);
      alertService.success("Link copiado.");
    } else {
      alertService.info("Copie o link na barra de endereços.");
    }
  }

  const cleanPhone = String(unidade.phone ?? "").replace(/[^\d+]/g, "");

  const streetWithNumber = unidade.address.number
    ? `${unidade.address.street}, ${unidade.address.number}`
    : unidade.address.street;
  const neighborhood = unidade.address.complement
    ? ` — ${unidade.address.complement}`
    : "";
  const enderecoCompleto = `${streetWithNumber}${neighborhood}, ${unidade.address.city}${
    unidade.address.state ? ` – ${unidade.address.state}` : ""
  }`;

  const horarioRaw = unidade.scheduleLabel.replace(/^Hoje:\s*/, "");
  const horarioLabel = unidade.openNow ? "Aberto agora" : horarioRaw;
  const horarioHoje = horarioRaw || "08:00 – 18:00";

  const notaDisplay = (unidade.rating > 0 ? unidade.rating : 4.8).toFixed(1);
  const avaliacoesCount = unidade.reviewCount > 0 ? unidade.reviewCount : 124;
  const avaliacoesList =
    avaliacoesMock.length > 0 ? avaliacoesMock : defaultAvaliacoes;

  return (
    <>
      <Link className="det-back" href={publicRoutes.home}>
        ← Voltar para a busca
      </Link>

      <div className="details-title">
        <h1>{unidade.name}</h1>
        <span className="chip">
          {unidadeTypeLabels[unidade.type] ?? unidade.type}
        </span>
        <span className={`chip ${unidade.openNow ? "chip-ok" : "chip-warn"}`}>
          {horarioLabel}
        </span>
        <div className="details-actions">
          <button
            className={`btn btn-ghost fav-btn${isFavorite ? " is-on" : ""}`}
            type="button"
            onClick={handleFavorite}
          >
            <span className="off">♡ Favoritar</span>
            <span className="on">♥ Favoritado</span>
          </button>
          <button className="btn btn-ghost" type="button" onClick={handleShare}>
            Compartilhar
          </button>
        </div>
      </div>

      <div className="quick-actions">
        {cleanPhone && (
          <a className="btn btn-primary" href={`tel:${cleanPhone}`}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />
            </svg>
            Ligar
          </a>
        )}
      </div>

      <div className="det-top">
        <div className="card det-gallery">
          <img
            className="gallery-main"
            id="foto"
            src={activePhoto}
            alt={`Foto de ${unidade.name}`}
          />
          {fotos.length > 1 && (
            <div className="thumbs">
              {fotos.map((f, i) => (
                <button
                  key={`${f}-${i}`}
                  type="button"
                  aria-label={`Ver foto ${i + 1} de ${fotos.length}`}
                  className={f === activePhoto ? "is-on" : undefined}
                  onClick={() => setActivePhoto(f)}
                >
                  <img src={f} alt={`Foto ${i + 1} de ${unidade.name}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="info-grid">
          <div className="card info-card">
            <h2>Contato</h2>
            <div className="info-line">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 21s-6-5.6-6-10a6 6 0 0 1 12 0c0 4.4-6 10-6 10z" />
                <circle cx="12" cy="11" r="2" />
              </svg>
              <span>{enderecoCompleto}</span>
            </div>
            {unidade.phone && (
              <a className="info-line" href={`tel:${cleanPhone}`}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />
                </svg>
                <span>{unidade.phone}</span>
              </a>
            )}
            {unidade.email && (
              <a className="info-line" href={`mailto:${unidade.email}`}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="M3 7l9 6 9-6" />
                </svg>
                <span>{unidade.email}</span>
              </a>
            )}
          </div>

          <div className="card info-card">
            <h2>Especialidades</h2>
            <div className="spec-grid">
              {unidade.specialties.map((s) => (
                <span className="chip" key={s}>
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div className="card info-card">
            <h2>Horários</h2>
            <div>Hoje: {horarioHoje}</div>
          </div>
        </div>
      </div>

      <section className="card det-map" aria-label="Mapa">
        <span>Mapa deve ficar aqui</span>
      </section>

      <section className="card info-card" id="avaliacoes">
        <div className="rev-head">
          <div className="rev-score">
            <b>{notaDisplay}</b>
            <div>
              <div className="stars" aria-hidden="true">
                {formatStars(Math.round(Number(notaDisplay)))}
              </div>
              <div>{avaliacoesCount} avaliações</div>
            </div>
          </div>
          <button
            className="btn btn-primary"
            type="button"
            onClick={handleReview}
          >
            Deixar avaliação
          </button>
        </div>

        {avaliacoesList.map((a, idx) => (
          <article className="review" key={a.id ?? idx}>
            <img
              className="avatar"
              src={
                a.authorAvatarUrl ||
                `https://i.pravatar.cc/80?img=${(idx % 50) + 12}`
              }
              alt=""
            />
            <div>
              <div className="review-top">
                <b>{a.authorName}</b>
                <span>
                  {a.createdAt.includes("-")
                    ? formatDate(a.createdAt)
                    : a.createdAt}
                </span>
              </div>
              <div
                className="stars"
                role="img"
                aria-label={`Nota ${a.rating} de 5`}
              >
                {formatStars(a.rating)}
              </div>
              <p>{a.comment}</p>
            </div>
          </article>
        ))}
      </section>
    </>
  );
}
