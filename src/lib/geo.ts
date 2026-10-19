import type { GeoPoint } from "@/types/Entities";

const EARTH_RADIUS_KM = 6371;

function toRadians(degrees: number) {
  return (degrees * Math.PI) / 180;
}

// Great-circle distance between two points (haversine formula).
export function distanceKm(from: GeoPoint, to: GeoPoint) {
  const dLat = toRadians(to.lat - from.lat);
  const dLng = toRadians(to.lng - from.lng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(from.lat)) *
      Math.cos(toRadians(to.lat)) *
      Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a));
}

export function formatDistance(km: number) {
  return km < 1
    ? `${Math.round(km * 1000)} m`
    : `${km.toFixed(1).replace(".", ",")} km`;
}

// Coordinates go in the URL rounded to ~100 m, enough for a nearby search
// without exposing the visitor's exact position in shared links.
export function roundCoordinate(value: number) {
  return Math.round(value * 1000) / 1000;
}

export function parseGeoPoint(lat: unknown, lng: unknown): GeoPoint | null {
  const latNumber = typeof lat === "string" ? Number(lat) : NaN;
  const lngNumber = typeof lng === "string" ? Number(lng) : NaN;
  if (
    !Number.isFinite(latNumber) ||
    !Number.isFinite(lngNumber) ||
    Math.abs(latNumber) > 90 ||
    Math.abs(lngNumber) > 180
  ) {
    return null;
  }
  return { lat: latNumber, lng: lngNumber };
}
