import type { NextApiRequest, NextApiResponse } from "next";
import Logger from "@/services/Logger";

const backendUrl = process.env.WEB_SAUDE_API_URL ?? "http://localhost:3333";

export async function proxyToBackend(
  req: NextApiRequest,
  res: NextApiResponse,
  path: string,
) {
  try {
    const query = new URLSearchParams();
    Object.entries(req.query).forEach(([key, value]) => {
      if (typeof value === "string") {
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
    });

    const payload = await response.json().catch(() => ({}));
    res.status(response.status).json(payload);
  } catch (error) {
    Logger.error("Falha ao falar com o backend", error);
    res.status(502).json({ message: "Backend indisponível" });
  }
}
