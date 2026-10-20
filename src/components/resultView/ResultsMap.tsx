import { useEffect, useRef, useState } from "react";
import type { Map as MapboxMap, Marker, Popup } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { publicRoutes } from "@/configs/Routes";
import type { GeoPoint } from "@/types/Entities";

export type MapPin = {
  id: string;
  number: number;
  name: string;
  location: GeoPoint;
};

type ResultsMapProps = {
  pins: MapPin[];
  total: number;
  // The visitor position, when shared; drawn as "você está aqui".
  origin: GeoPoint | null;
  highlightedId: string | null;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
};

type MapStatus = "loading" | "ready" | "error";

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
const STYLE_URL = "mapbox://styles/mapbox/streets-v12";
// Brazil, until there are results to frame.
const INITIAL_VIEW = { center: [-51.9, -14.2] as [number, number], zoom: 3 };
// Past this, a map that never finished loading counts as unavailable (E7).
const LOAD_TIMEOUT_MS = 15000;

// Popup built with DOM nodes, so unit names are never parsed as HTML.
function popupContent(pin: MapPin) {
  const wrapper = document.createElement("div");
  wrapper.className = "map-popup";
  const name = document.createElement("b");
  name.textContent = pin.name;
  const link = document.createElement("a");
  link.href = publicRoutes.unitDetails(pin.id);
  link.textContent = "Ver detalhes";
  wrapper.append(name, link);
  return wrapper;
}

/**
 * Mapbox GL map with one marker per unit, placed exactly at its registered
 * coordinates (RN12). The library is loaded on the client only; if it or the
 * map style fails to load, the box shows "Mapa indisponível no momento" and
 * the list keeps working on its own (E7).
 */
export default function ResultsMap({
  pins,
  total,
  origin,
  highlightedId,
  onHover,
  onSelect,
}: ResultsMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapboxMap | null>(null);
  const libRef = useRef<typeof import("mapbox-gl").default | null>(null);
  const markersRef = useRef<Map<string, Marker>>(new Map());
  const originMarkerRef = useRef<Marker | null>(null);
  // One popup for the whole map: opening a unit closes the previous one.
  const popupRef = useRef<Popup | null>(null);
  const [status, setStatus] = useState<MapStatus>("loading");
  const statusRef = useRef<MapStatus>("loading");
  const handlersRef = useRef({ onHover, onSelect });
  handlersRef.current = { onHover, onSelect };

  function updateStatus(next: MapStatus) {
    statusRef.current = next;
    setStatus(next);
  }

  useEffect(() => {
    const container = containerRef.current;
    if (!TOKEN || !container) {
      updateStatus("error");
      return;
    }
    let cancelled = false;
    let map: MapboxMap | null = null;
    const timer = window.setTimeout(() => {
      if (statusRef.current !== "ready") {
        updateStatus("error");
      }
    }, LOAD_TIMEOUT_MS);

    import("mapbox-gl")
      .then(({ default: mapboxgl }) => {
        if (cancelled) {
          return;
        }
        mapboxgl.accessToken = TOKEN;
        map = new mapboxgl.Map({
          container,
          style: STYLE_URL,
          ...INITIAL_VIEW,
        });
        map.addControl(
          new mapboxgl.NavigationControl({ showCompass: false }),
          "top-right",
        );
        map.on("load", () => {
          window.clearTimeout(timer);
          updateStatus("ready");
        });
        // An invalid token or blocked style fails before "load". Later
        // errors (a missing tile, say) do not take the map down.
        map.on("error", () => {
          if (statusRef.current !== "ready") {
            updateStatus("error");
          }
        });
        libRef.current = mapboxgl;
        mapRef.current = map;
      })
      .catch(() => updateStatus("error"));

    const markers = markersRef.current;
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      markers.clear();
      originMarkerRef.current = null;
      popupRef.current = null;
      map?.remove();
      mapRef.current = null;
    };
  }, []);

  // Rebuilds the markers when the loaded units or the visitor change, and
  // frames all of them.
  useEffect(() => {
    const map = mapRef.current;
    const mapboxgl = libRef.current;
    if (status !== "ready" || !map || !mapboxgl) {
      return;
    }

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();
    originMarkerRef.current?.remove();
    originMarkerRef.current = null;
    popupRef.current?.remove();
    popupRef.current = new mapboxgl.Popup({
      offset: 20,
      closeButton: true,
      focusAfterOpen: false,
    });
    const popup = popupRef.current;

    const bounds = new mapboxgl.LngLatBounds();

    for (const pin of pins) {
      const lngLat: [number, number] = [pin.location.lng, pin.location.lat];
      // Mapbox positions the wrapper with a transform; the styled pin is a
      // child so its own hover scale does not move it off the coordinates.
      const element = document.createElement("div");
      const button = document.createElement("button");
      button.type = "button";
      button.className = "map-marker map-pin";
      button.textContent = String(pin.number);
      button.title = pin.name;
      button.setAttribute("aria-label", `${pin.number}. ${pin.name}`);
      button.addEventListener("mouseenter", () =>
        handlersRef.current.onHover(pin.id),
      );
      button.addEventListener("mouseleave", () =>
        handlersRef.current.onHover(null),
      );
      // Clicking a marker opens the unit: its popup on the map and its
      // card in the list.
      button.addEventListener("click", (event) => {
        event.stopPropagation();
        popup.setLngLat(lngLat).setDOMContent(popupContent(pin)).addTo(map);
        handlersRef.current.onSelect(pin.id);
      });
      element.append(button);

      const marker = new mapboxgl.Marker({ element })
        .setLngLat(lngLat)
        .addTo(map);
      markersRef.current.set(pin.id, marker);
      bounds.extend(lngLat);
    }

    if (origin) {
      const element = document.createElement("div");
      const dot = document.createElement("span");
      dot.className = "map-origin";
      dot.title = "Você está aqui";
      dot.setAttribute("aria-label", "Você está aqui");
      element.append(dot);
      originMarkerRef.current = new mapboxgl.Marker({ element })
        .setLngLat([origin.lng, origin.lat])
        .addTo(map);
      bounds.extend([origin.lng, origin.lat]);
    }

    if (!bounds.isEmpty()) {
      map.fitBounds(bounds, { padding: 60, maxZoom: 14, duration: 600 });
    }
  }, [pins, origin, status]);

  useEffect(() => {
    markersRef.current.forEach((marker, id) => {
      marker
        .getElement()
        .firstElementChild?.classList.toggle(
          "is-highlighted",
          id === highlightedId,
        );
    });
  }, [highlightedId, pins, status]);

  const withoutLocation = total - pins.length;

  return (
    <div className="results-map">
      <div className="results-map-canvas" ref={containerRef} />

      {status === "loading" && (
        <p className="results-map-message">Carregando mapa…</p>
      )}
      {status === "error" && (
        <p className="results-map-message" role="status">
          Mapa indisponível no momento
        </p>
      )}

      {status === "ready" && (
        <div className="results-map-summary">
          {total === 0 ? (
            <b>Nenhum estabelecimento para mostrar</b>
          ) : (
            <>
              <b>
                {pins.length} de {total} estabelecimentos no mapa
              </b>
              {withoutLocation > 0 && (
                <span>
                  {withoutLocation === 1
                    ? "1 não tem localização cadastrada e aparece só na lista."
                    : `${withoutLocation} não têm localização cadastrada e aparecem só na lista.`}
                </span>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
