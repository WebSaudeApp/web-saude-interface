import { useEffect, useRef, useState } from "react";
import "mapbox-gl/dist/mapbox-gl.css";
import type { GeoPoint } from "@/types/Entities";

type UnitMapProps = {
  name: string;
  location: GeoPoint;
};

type MapStatus = "loading" | "ready" | "error";

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
const STYLE_URL = "mapbox://styles/mapbox/streets-v12";
const ZOOM = 15;
// Past this, a map that never finished loading counts as unavailable (E7).
const LOAD_TIMEOUT_MS = 15000;
const MARKER_COLOR = "#0f766e";

/**
 * Map of a single unit, with the marker exactly on its registered
 * coordinates (RN12). Like the results map, the library loads on the client
 * only, and a failure shows "Mapa indisponível no momento" (E7) while the
 * rest of the page keeps working.
 */
export default function UnitMap({ name, location }: UnitMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [status, setStatus] = useState<MapStatus>("loading");
  const { lat, lng } = location;

  useEffect(() => {
    const container = containerRef.current;
    if (!TOKEN || !container) {
      setStatus("error");
      return;
    }
    setStatus("loading");
    let cancelled = false;
    let ready = false;
    let map: import("mapbox-gl").Map | null = null;
    const timer = window.setTimeout(() => {
      if (!ready) {
        setStatus("error");
      }
    }, LOAD_TIMEOUT_MS);

    import("mapbox-gl")
      .then(({ default: mapboxgl }) => {
        if (cancelled) {
          return;
        }
        mapboxgl.accessToken = TOKEN;
        const center: [number, number] = [lng, lat];
        map = new mapboxgl.Map({
          container,
          style: STYLE_URL,
          center,
          zoom: ZOOM,
        });
        map.addControl(
          new mapboxgl.NavigationControl({ showCompass: false }),
          "top-right",
        );
        // The pin's tip sits on the coordinates.
        const marker = new mapboxgl.Marker({ color: MARKER_COLOR })
          .setLngLat(center)
          .addTo(map);
        marker.getElement().setAttribute("title", name);
        map.on("load", () => {
          ready = true;
          window.clearTimeout(timer);
          setStatus("ready");
        });
        // An invalid token or blocked style fails before "load"; a missing
        // tile later does not take the map down.
        map.on("error", () => {
          if (!ready) {
            setStatus("error");
          }
        });
      })
      .catch(() => setStatus("error"));

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      map?.remove();
    };
  }, [lat, lng, name]);

  return (
    <div className="det-map-box">
      <div
        className="det-map-canvas"
        ref={containerRef}
        role="region"
        aria-label={`Mapa com a localização de ${name}`}
      />
      {status === "loading" && (
        <p className="results-map-message">Carregando mapa…</p>
      )}
      {status === "error" && (
        <p className="results-map-message" role="status">
          Mapa indisponível no momento
        </p>
      )}
    </div>
  );
}
