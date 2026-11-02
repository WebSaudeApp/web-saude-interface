import { useGeolocation } from "@/hooks/useGeolocation";
import type { GeoPoint } from "@/types/Entities";

type UseLocationButtonProps = {
  className: string;
  onLocate: (point: GeoPoint) => void;
  // Called when no location arrives, so the page can lead the visitor to
  // type the city instead.
  onError?: () => void;
  // Extra line shown with the error, e.g. a city suggested from the
  // connection after the browser location failed.
  notice?: string;
  // Toolbar version: on wide screens only the pin shows (the name stays as
  // tooltip and accessible label); on phones the CSS shows the text too.
  compact?: boolean;
};

const LABEL = "Usar minha localização";

// The permission prompt only appears after this click, never on page load.
export default function UseLocationButton({
  className,
  onLocate,
  onError,
  notice,
  compact = false,
}: UseLocationButtonProps) {
  const { status, error, request } = useGeolocation();

  async function handleClick() {
    const point = await request();
    if (point) {
      onLocate(point);
    } else {
      onError?.();
    }
  }

  const button = (
    <button
      type="button"
      className={`${className} location-button${
        status === "loading" ? " is-loading" : ""
      }`}
      disabled={status === "loading"}
      onClick={handleClick}
      aria-label={compact ? LABEL : undefined}
      title={compact ? LABEL : undefined}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 21s-6-5.6-6-11a6 6 0 0 1 12 0c0 5.4-6 11-6 11z" />
        <circle cx="12" cy="10" r="2.2" />
      </svg>
      {compact ? (
        <span className="location-text">{LABEL}</span>
      ) : status === "loading" ? (
        "Obtendo localização…"
      ) : (
        LABEL
      )}
    </button>
  );

  const errorLine = error && (
    <p className="location-error" role="alert">
      {error}
    </p>
  );

  // In the toolbar the messages float under the button instead of pushing
  // the row around.
  return compact ? (
    <span className="location-wrap">
      {button}
      {error && (
        <span className="location-messages">
          {errorLine}
          {notice && <p className="location-notice">{notice}</p>}
        </span>
      )}
    </span>
  ) : (
    <>
      {button}
      {errorLine}
    </>
  );
}
