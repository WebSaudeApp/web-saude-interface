import type { IncomingHttpHeaders } from "http";
import estados from "@/configs/Estados";
import type { Place } from "@/lib/reverseGeocode";

// Vercel resolves the visitor's IP itself and adds the x-vercel-ip-* headers,
// so our code never reads, forwards, logs or stores the IP: it only sees the
// resulting city and state. Elsewhere (local development, other hosts) the
// headers do not exist and the result is null.

function readHeader(headers: IncomingHttpHeaders, name: string) {
  const value = headers[name];
  return typeof value === "string" ? value : undefined;
}

// Vercel sends the city URL-encoded ("S%C3%A3o%20Paulo").
function decodeCity(value: string) {
  try {
    return decodeURIComponent(value).trim();
  } catch {
    return "";
  }
}

/**
 * Approximate city and state of the visitor's connection (FE-03), or null
 * when there is nothing useful: no headers, outside Brazil or an unknown state.
 */
export function ipPlaceFromHeaders(headers: IncomingHttpHeaders): Place | null {
  const country = readHeader(headers, "x-vercel-ip-country");
  const region = readHeader(
    headers,
    "x-vercel-ip-country-region",
  )?.toUpperCase();
  const cityHeader = readHeader(headers, "x-vercel-ip-city");
  const city = cityHeader ? decodeCity(cityHeader) : "";

  if (
    country !== "BR" ||
    !region ||
    !estados.includes(region) ||
    !city ||
    city.length > 80
  ) {
    return null;
  }
  return { city, uf: region };
}
