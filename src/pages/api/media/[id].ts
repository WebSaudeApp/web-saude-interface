import type { NextApiRequest, NextApiResponse } from "next";
import { backendUrl } from "@/lib/backendProxy";
import Logger from "@/services/Logger";

// Streams a unit photo from the API (`GET /midias/:id`). It is binary, so it
// cannot go through the JSON proxy.
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const id = String(req.query.id ?? "");
  try {
    const response = await fetch(
      `${backendUrl}/midias/${encodeURIComponent(id)}`,
    );
    if (!response.ok) {
      res.status(response.status).end();
      return;
    }
    res.setHeader(
      "Content-Type",
      response.headers.get("content-type") ?? "application/octet-stream",
    );
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.send(Buffer.from(await response.arrayBuffer()));
  } catch (error) {
    Logger.error("Falha ao buscar mídia no backend", error);
    res.status(502).end();
  }
}
