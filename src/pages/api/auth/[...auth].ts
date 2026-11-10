import type { NextApiRequest, NextApiResponse } from "next";
import { MAX_DURATION_SECONDS, proxyToBackend } from "@/lib/backendProxy";

const authMap: Record<string, string> = {
  login: "/auth/login",
  register: "/auth/register",
  "verify-email": "/auth/verify-email",
  "recover-password": "/auth/recover-password",
};

// Vercel stops the function at its own limit, so it must outlast the proxy's.
export const config = { maxDuration: MAX_DURATION_SECONDS };

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const slug = Array.isArray(req.query.auth) ? req.query.auth.join("/") : "";
  const path = authMap[slug];

  if (!path) {
    res.status(404).json({ message: "Rota de autenticação não encontrada" });
    return;
  }

  return proxyToBackend(req, res, path);
}
