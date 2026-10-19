import { useCallback, useState } from "react";
import type { GeoPoint } from "@/types/Entities";

type GeolocationStatus = "idle" | "loading" | "success" | "error";

// E9: one message for every way the location can fail to arrive.
export const LOCATION_ERROR_MESSAGE =
  "Não foi possível obter sua localização. Informe a cidade e o estado.";

const TIMEOUT_MS = 10000;

/**
 * Asks the browser for the visitor's position only when `request` is called,
 * so the permission prompt never shows up on page load (RN14). Resolves null
 * when it is denied, unsupported, unavailable or takes over 10 seconds.
 */
export function useGeolocation() {
  const [status, setStatus] = useState<GeolocationStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const request = useCallback(() => {
    return new Promise<GeoPoint | null>((resolve) => {
      let settled = false;
      let timer: number | undefined;

      function finish(point: GeoPoint | null) {
        if (settled) {
          return;
        }
        settled = true;
        window.clearTimeout(timer);
        setStatus(point ? "success" : "error");
        setError(point ? null : LOCATION_ERROR_MESSAGE);
        resolve(point);
      }

      // The Geolocation API only exists in a secure context (HTTPS).
      if (!window.isSecureContext || !navigator.geolocation) {
        finish(null);
        return;
      }

      setStatus("loading");
      setError(null);
      // The API's own timeout only starts after the permission is granted;
      // this one also covers a prompt the visitor leaves unanswered.
      timer = window.setTimeout(() => finish(null), TIMEOUT_MS);
      navigator.geolocation.getCurrentPosition(
        (position) =>
          finish({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }),
        () => finish(null),
        { enableHighAccuracy: false, timeout: TIMEOUT_MS, maximumAge: 60000 },
      );
    });
  }, []);

  return { status, error, request };
}
