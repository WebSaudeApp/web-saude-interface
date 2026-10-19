import type { GeoPoint } from "@/types/Entities";

export type Place = {
  city: string;
  uf: string;
};

type NominatimResponse = {
  address?: {
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    "ISO3166-2-lvl4"?: string;
  };
};

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/reverse";

/**
 * Server-side only: turns coordinates into city and state with OpenStreetMap
 * Nominatim (usage policy asks for an identifying User-Agent). Returns null
 * when the lookup fails or the point is outside Brazil.
 */
export async function reverseGeocode({
  lat,
  lng,
}: GeoPoint): Promise<Place | null> {
  const url = new URL(NOMINATIM_URL);
  url.search = new URLSearchParams({
    lat: String(lat),
    lon: String(lng),
    format: "jsonv2",
    zoom: "10",
    addressdetails: "1",
    "accept-language": "pt-BR",
  }).toString();

  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "WebSaude/0.1 (web-saude-interface)" },
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) {
      return null;
    }
    const { address } = (await response.json()) as NominatimResponse;
    const city =
      address?.city ??
      address?.town ??
      address?.village ??
      address?.municipality;
    const iso = address?.["ISO3166-2-lvl4"] ?? "";
    if (!city || !iso.startsWith("BR-")) {
      return null;
    }
    return { city, uf: iso.slice(3) };
  } catch {
    return null;
  }
}
