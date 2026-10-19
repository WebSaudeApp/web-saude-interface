import type { NextApiRequest, NextApiResponse } from "next";
import { parseGeoPoint, roundCoordinate } from "@/lib/geo";
import { reverseGeocode } from "@/lib/reverseGeocode";

// Resolves the visitor coordinates into city/state for the search filters.
// Runs on the server so the browser only talks to this site.
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).end();
  }
  const point = parseGeoPoint(req.query.lat, req.query.lng);
  if (!point) {
    return res.status(400).json({ error: "Coordenadas inválidas." });
  }
  const place = await reverseGeocode({
    lat: roundCoordinate(point.lat),
    lng: roundCoordinate(point.lng),
  });
  if (!place) {
    return res.status(404).json({ error: "Cidade não encontrada." });
  }
  res.setHeader("Cache-Control", "private, max-age=3600");
  return res.status(200).json(place);
}
