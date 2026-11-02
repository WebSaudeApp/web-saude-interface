import type { NextApiRequest, NextApiResponse } from "next";
import estados from "@/configs/Estados";

// Approximate city and state of the visitor's connection (FE-03).
//
// On Vercel the platform itself resolves the visitor's IP and adds the
// x-vercel-ip-* headers, so this route never reads, forwards, logs or stores
// the IP: it only sees the resulting city and state. Outside Vercel (local
// development, for instance) the headers do not exist and the answer is
// "no location", which the page treats as "nothing to suggest".

function readHeader(req: NextApiRequest, name: string) {
  const value = req.headers[name];
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

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.status(405).end();
    return;
  }

  // Depends on who is asking, so it must never be cached or shared.
  res.setHeader("Cache-Control", "private, no-store");

  const country = readHeader(req, "x-vercel-ip-country");
  const region = readHeader(req, "x-vercel-ip-country-region")?.toUpperCase();
  const cityHeader = readHeader(req, "x-vercel-ip-city");
  const city = cityHeader ? decodeCity(cityHeader) : "";

  // Only Brazilian results that match a known state are useful to the filters.
  if (
    country !== "BR" ||
    !region ||
    !estados.includes(region) ||
    !city ||
    city.length > 80
  ) {
    res.status(204).end();
    return;
  }

  res.status(200).json({ city, uf: region });
}
