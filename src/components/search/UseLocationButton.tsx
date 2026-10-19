import { useGeolocation } from "@/hooks/useGeolocation";
import type { GeoPoint } from "@/types/Entities";

type UseLocationButtonProps = {
  className: string;
  onLocate: (point: GeoPoint) => void;
};

// The permission prompt only appears after this click, never on page load.
export default function UseLocationButton({
  className,
  onLocate,
}: UseLocationButtonProps) {
  const { status, error, request } = useGeolocation();

  async function handleClick() {
    const point = await request();
    if (point) {
      onLocate(point);
    }
  }

  return (
    <>
      <button
        type="button"
        className={`${className} location-button`}
        disabled={status === "loading"}
        onClick={handleClick}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 21s-6-5.6-6-11a6 6 0 0 1 12 0c0 5.4-6 11-6 11z" />
          <circle cx="12" cy="10" r="2.2" />
        </svg>
        {status === "loading"
          ? "Obtendo localização…"
          : "Usar minha localização"}
      </button>
      {error && (
        <p className="location-error" role="alert">
          {error}
        </p>
      )}
    </>
  );
}
