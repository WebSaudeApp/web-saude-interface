import { useCallback, useState } from "react";
import type { GeoPoint } from "@/types/Entities";

type GeolocationStatus = "idle" | "loading" | "success" | "error";

const errorMessages: Record<number, string> = {
  1: "Permissão de localização negada. Libere o acesso nas configurações do navegador.",
  2: "Não foi possível descobrir sua localização agora.",
  3: "A localização demorou demais para responder. Tente novamente.",
};

/**
 * Asks the browser for the visitor's position only when `request` is called,
 * so the permission prompt never shows up on page load (RN14). The
 * Geolocation API only works in a secure context (HTTPS or localhost).
 */
export function useGeolocation() {
  const [status, setStatus] = useState<GeolocationStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const request = useCallback(() => {
    return new Promise<GeoPoint | null>((resolve) => {
      function fail(message: string) {
        setStatus("error");
        setError(message);
        resolve(null);
      }

      if (!window.isSecureContext) {
        fail("A localização só funciona em conexão segura (HTTPS).");
        return;
      }
      if (!("geolocation" in navigator)) {
        fail("Seu navegador não permite compartilhar a localização.");
        return;
      }

      setStatus("loading");
      setError(null);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setStatus("success");
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (positionError) =>
          fail(errorMessages[positionError.code] ?? errorMessages[2]),
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 },
      );
    });
  }, []);

  return { status, error, request };
}
