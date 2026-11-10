import type { NextApiRequest, NextApiResponse } from "next";
import Logger from "@/services/Logger";

export const backendUrl =
  process.env.WEB_SAUDE_API_URL ?? "https://web-saude-api.onrender.com";

// The free Render plan takes about 45 s to wake the API after idling (43 s
// measured), so the limit leaves room for that and still fails far sooner
// than Node's own default (about 5 minutes). The function limit declared by
// the API routes (`maxDuration`) must be higher than this.
export const MAX_DURATION_SECONDS = 60;
const BACKEND_TIMEOUT_MS = (MAX_DURATION_SECONDS - 5) * 1000;

export async function proxyToBackend(
  req: NextApiRequest,
  res: NextApiResponse,
  path: string,
  // Query keys that belong to the page route (like [id]) and must not be
  // forwarded: the API rejects unknown query parameters.
  omitQuery: string[] = [],
) {
  try {
    const query = new URLSearchParams();
    Object.entries(req.query).forEach(([key, value]) => {
      if (typeof value === "string" && !omitQuery.includes(key)) {
        query.set(key, value);
      }
    });

    const url = `${backendUrl}${path}${query.size ? `?${query}` : ""}`;
    const response = await fetch(url, {
      method: req.method,
      headers: {
        "Content-Type": "application/json",
        ...(req.headers.authorization
          ? { Authorization: req.headers.authorization }
          : {}),
      },
      body: req.method === "GET" ? undefined : JSON.stringify(req.body ?? {}),
      signal: AbortSignal.timeout(BACKEND_TIMEOUT_MS),
    });

    const payload = await response.json().catch(() => ({}));
    res.status(response.status).json(payload);
  } catch (error) {
    Logger.error("Falha ao falar com o backend", error);
    if (error instanceof DOMException && error.name === "TimeoutError") {
      res.status(504).json({ message: "Backend demorou para responder" });
      return;
    }
    res.status(502).json({ message: "Backend indisponível" });
  }
}
