import { useMemo, useState } from "react";
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

const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
// Keeps pins away from the edges and from the summary box at the bottom.
const PADDING = { x: 14, top: 12, bottom: 26 };

// Places points as a percentage of the map box from their bounding box. The
// map itself is an illustration until a real map provider is integrated;
// only the relative positions come from the data.
function makeProjection(points: GeoPoint[]) {
  const lats = points.map((point) => point.lat);
  const lngs = points.map((point) => point.lng);
  const [minLat, maxLat] = [Math.min(...lats), Math.max(...lats)];
  const [minLng, maxLng] = [Math.min(...lngs), Math.max(...lngs)];
  const spanLat = maxLat - minLat || 1;
  const spanLng = maxLng - minLng || 1;
  const width = 100 - PADDING.x * 2;
  const height = 100 - PADDING.top - PADDING.bottom;

  return (point: GeoPoint) => ({
    x:
      maxLng === minLng
        ? 50
        : PADDING.x + ((point.lng - minLng) / spanLng) * width,
    y:
      maxLat === minLat
        ? 45
        : PADDING.top + ((maxLat - point.lat) / spanLat) * height,
  });
}

export default function ResultsMap({
  pins,
  total,
  origin,
  highlightedId,
  onHover,
  onSelect,
}: ResultsMapProps) {
  const [zoom, setZoom] = useState(MIN_ZOOM);
  const { projected, originPosition } = useMemo(() => {
    const points = pins.map((pin) => pin.location);
    if (origin) {
      points.push(origin);
    }
    const project = makeProjection(points);
    return {
      projected: pins.map((pin) => ({ ...pin, ...project(pin.location) })),
      originPosition: origin ? project(origin) : null,
    };
  }, [pins, origin]);
  const withoutLocation = total - pins.length;

  function zoomed(value: number) {
    return 50 + (value - 50) * zoom;
  }

  function isVisible(position: { x: number; y: number }) {
    const [x, y] = [zoomed(position.x), zoomed(position.y)];
    return x >= 0 && x <= 100 && y >= 0 && y <= 100;
  }

  return (
    <div className="results-map">
      <svg
        className="results-map-bg"
        viewBox="0 0 380 720"
        preserveAspectRatio="xMidYMid slice"
        style={{ transform: `scale(${zoom})` }}
        aria-hidden="true"
      >
        <rect width="380" height="720" className="map-land" />
        <path
          d="M330 0h50v720h-90c20-140 40-300 40-420S340 80 330 0z"
          className="map-sea"
        />
        <rect
          x="30"
          y="40"
          width="120"
          height="90"
          rx="8"
          className="map-block"
        />
        <rect
          x="180"
          y="60"
          width="110"
          height="120"
          rx="8"
          className="map-block"
        />
        <rect
          x="10"
          y="420"
          width="140"
          height="110"
          rx="8"
          className="map-block"
        />
        <rect
          x="170"
          y="560"
          width="80"
          height="80"
          rx="8"
          className="map-park"
        />
        <path
          d="M0 320c60-10 120 30 180 20s100-40 140-30 60 10 60 10"
          className="map-river"
        />
        <path
          d="M0 90l320-25M0 195l330-20M60 260l260-12M0 520l300 25"
          className="map-street"
        />
        <path
          d="M10 0l90 720M160 0l-12 720M220 0l30 720"
          className="map-street"
        />
      </svg>

      {projected.map((pin) => {
        if (!isVisible(pin)) {
          return null;
        }
        return (
          <button
            key={pin.id}
            type="button"
            className={`map-marker map-pin${pin.id === highlightedId ? " is-highlighted" : ""}`}
            style={{ left: `${zoomed(pin.x)}%`, top: `${zoomed(pin.y)}%` }}
            title={pin.name}
            aria-label={`${pin.number}. ${pin.name}`}
            onMouseEnter={() => onHover(pin.id)}
            onMouseLeave={() => onHover(null)}
            onClick={() => onSelect(pin.id)}
          >
            {pin.number}
          </button>
        );
      })}

      {originPosition && isVisible(originPosition) && (
        <span
          className="map-origin"
          style={{
            left: `${zoomed(originPosition.x)}%`,
            top: `${zoomed(originPosition.y)}%`,
          }}
          title="Você está aqui"
          aria-label="Você está aqui"
        />
      )}

      <div className="results-map-zoom">
        <button
          type="button"
          aria-label="Aproximar"
          disabled={zoom >= MAX_ZOOM}
          onClick={() => setZoom((value) => Math.min(MAX_ZOOM, value + 0.5))}
        >
          +
        </button>
        <button
          type="button"
          aria-label="Afastar"
          disabled={zoom <= MIN_ZOOM}
          onClick={() => setZoom((value) => Math.max(MIN_ZOOM, value - 0.5))}
        >
          −
        </button>
      </div>

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
    </div>
  );
}
