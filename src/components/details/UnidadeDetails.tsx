import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { unidadeTypeLabels } from "@/configs/DisplayFields";
import { publicRoutes } from "@/configs/Routes";
import ShareMenu from "@/components/details/ShareMenu";
import UnitMap from "@/components/details/UnitMap";
import { useAuth } from "@/hooks/useAuth";
import { useFavorite } from "@/hooks/useFavorite";
import { arrivedFromSearch } from "@/lib/searchOrigin";
import { formatStars } from "@/lib/stars";
import { alertService } from "@/services/AlertService";
import type { Unidade } from "@/types/Entities";

type UnidadeDetailsProps = {
  unidade: Unidade;
};

// Week order of the hours card, starting on Monday; the number is Date#getDay.
const weekDays = [
  { day: 1, label: "Segunda-feira" },
  { day: 2, label: "Terça-feira" },
  { day: 3, label: "Quarta-feira" },
  { day: 4, label: "Quinta-feira" },
  { day: 5, label: "Sexta-feira" },
  { day: 6, label: "Sábado" },
  { day: 0, label: "Domingo" },
];

// wa.me wants country code and digits only; the API stores Brazilian numbers
// without the country code.
function whatsappLink(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length < 10) {
    return undefined;
  }
  const full =
    digits.length > 11 && digits.startsWith("55") ? digits : `55${digits}`;
  return `https://wa.me/${full}`;
}

// Registered sites may come without the scheme; only http(s) becomes a link.
function websiteLink(value: string) {
  try {
    const url = new URL(
      /^https?:\/\//i.test(value) ? value : `https://${value}`,
    );
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return undefined;
    }
    const path = url.pathname === "/" ? "" : url.pathname.replace(/\/$/, "");
    return { href: url.href, label: `${url.host}${path}` };
  } catch {
    return undefined;
  }
}

export default function UnidadeDetails({ unidade }: UnidadeDetailsProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [isFavorite, toggleFavorite] = useFavorite(unidade.id);

  const fotos = unidade.photos;
  // The page remounts this component per unit (`key`), so the first photo is
  // only needed at the start.
  const [activePhoto, setActivePhoto] = useState<string | undefined>(fotos[0]);

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

  // The API only lists the days the unit opens; a missing day is closed. A
  // unit with no hours at all has not told us, which is not the same as closed.
  const hasHours = unidade.open24h || unidade.hours.length > 0;
  const today = new Date().getDay();
  const weekHours = weekDays.map(({ day, label }) => {
    const hour = unidade.hours.find((item) => item.weekday === day);
    let value = "Fechado";
    if (unidade.open24h) {
      value = "24 horas";
    } else if (hour) {
      value = `${hour.opensAt} – ${hour.closesAt}`;
    }
    return { day, label, value, closed: value === "Fechado" };
  });

  // The API has no review list yet; the average and the count only show when
  // it has them, never as placeholders.
  const hasReviews = unidade.reviewCount > 0;
  const notaDisplay = unidade.rating.toFixed(1);
  const whatsapp = unidade.whatsapp
    ? whatsappLink(unidade.whatsapp)
    : undefined;
  const website = unidade.website ? websiteLink(unidade.website) : undefined;

  return (
    <>
      {/* Back to the filtered list when the visitor came from it; a shared
          link has no list behind it, so it goes to the plain search. */}
      <Link
        className="det-back"
        href={publicRoutes.home}
        onClick={(event) => {
          if (arrivedFromSearch()) {
            event.preventDefault();
            router.back();
          }
        }}
      >
        ← Voltar para a busca
      </Link>

      <div className="details-title">
        <h1>{unidade.name}</h1>
        <span className="chip">
          {unidadeTypeLabels[unidade.type] ?? unidade.type}
        </span>
        {hasHours ? (
          <span className={`chip ${unidade.openNow ? "chip-ok" : "chip-warn"}`}>
            {unidade.openNow ? "Aberto agora" : "Fechado agora"}
          </span>
        ) : (
          <span className="chip chip-muted">Horário não informado</span>
        )}
        <a className="det-rating-link" href="#avaliacoes">
          {hasReviews ? (
            <>
              <span className="stars" aria-hidden="true">
                ★
              </span>
              {notaDisplay} · {unidade.reviewCount} avaliações
            </>
          ) : (
            "Sem avaliações"
          )}
        </a>
        <div className="details-actions">
          <button
            className={`icon-btn fav-btn${isFavorite ? " is-on" : ""}`}
            type="button"
            onClick={handleFavorite}
            aria-pressed={isFavorite}
            aria-label={isFavorite ? "Remover dos favoritos" : "Favoritar"}
            title={isFavorite ? "Remover dos favoritos" : "Favoritar"}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 20.5s-7.5-4.6-9.4-9.1C1.2 8 3.2 4.5 6.8 4.5c2.2 0 3.7 1.3 5.2 3 1.5-1.7 3-3 5.2-3 3.6 0 5.6 3.5 4.2 6.9-1.9 4.5-9.4 9.1-9.4 9.1z" />
            </svg>
          </button>
          <ShareMenu name={unidade.name} />
        </div>
      </div>

      <div className="det-layout">
        <div className="det-map-sticky">
          <section className="card det-map" aria-label="Mapa">
            {unidade.location ? (
              <UnitMap name={unidade.name} location={unidade.location} />
            ) : (
              <p className="det-map-empty">
                Localização não cadastrada para esta unidade.
              </p>
            )}
          </section>
        </div>

        <div className="det-content">
          <div className="card info-card">
            <h2>Especialidades</h2>
            {unidade.specialties.length > 0 ? (
              <div className="spec-grid">
                {unidade.specialties.map((s) => (
                  <span className="chip" key={s}>
                    {s}
                  </span>
                ))}
              </div>
            ) : (
              <p className="empty-note">Nenhuma especialidade informada.</p>
            )}
          </div>

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
              <div className="info-line info-phone">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />
                </svg>
                <span>{unidade.phone}</span>
                {cleanPhone && (
                  <a
                    className="btn btn-primary call-btn"
                    href={`tel:${cleanPhone}`}
                  >
                    Ligar
                  </a>
                )}
              </div>
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
            {whatsapp && (
              <a
                className="info-line"
                href={whatsapp}
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M4 20l1.3-4A8 8 0 1 1 8 18.7L4 20z" />
                  <path d="M9.5 9.5c.3 2 2 3.7 4 4l1-1.2-1.8-.9-.7.6a3 3 0 0 1-1.2-1.2l.6-.7-.9-1.8-1 1.2z" />
                </svg>
                <span>WhatsApp: {unidade.whatsapp}</span>
              </a>
            )}
            {website && (
              <a
                className="info-line"
                href={website.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M3 12h18M12 3c3 3.2 3 14.8 0 18M12 3c-3 3.2-3 14.8 0 18" />
                </svg>
                <span>{website.label}</span>
              </a>
            )}
          </div>

          <div className="card info-card">
            <h2>Horários</h2>
            {!hasHours ? (
              <p className="empty-note">
                Horário de funcionamento não informado.
              </p>
            ) : (
              <ul className="week-hours">
                {weekHours.map((item) => (
                  <li
                    key={item.day}
                    className={`week-row${item.day === today ? " is-today" : ""}`}
                    aria-current={item.day === today ? "date" : undefined}
                  >
                    <span>{item.label}</span>
                    <span className={item.closed ? "week-closed" : undefined}>
                      {item.value}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {activePhoto && (
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
          )}

          <section className="card info-card" id="avaliacoes">
            <div className="rev-head">
              {hasReviews ? (
                <div className="rev-score">
                  <b>{notaDisplay}</b>
                  <div>
                    <div className="stars" aria-hidden="true">
                      {formatStars(Math.min(5, Math.round(unidade.rating)))}
                    </div>
                    <div>{unidade.reviewCount} avaliações</div>
                  </div>
                </div>
              ) : (
                <h2>Avaliações</h2>
              )}
              <button
                className="btn btn-primary"
                type="button"
                onClick={handleReview}
              >
                Deixar avaliação
              </button>
            </div>
            <p className="empty-note">
              {hasReviews
                ? "Os comentários desta unidade ainda não estão disponíveis."
                : "Ainda não há avaliações para esta unidade."}
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
