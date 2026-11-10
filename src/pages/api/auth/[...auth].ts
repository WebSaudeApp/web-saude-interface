import type { NextApiRequest, NextApiResponse } from "next";
import { proxyToBackend } from "@/lib/backendProxy";

const authMap: Record<string, string> = {
  login: "/auth/login",
  register: "/auth/register",
  "verify-email": "/auth/verify-email",
  "recover-password": "/auth/recover-password",
};

// Next only reads a literal here. Must stay above the proxy timeout
// (`BACKEND_TIMEOUT_MS` in lib/backendProxy.ts).
export const config = { maxDuration: 60 };

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const slug = Array.isArray(req.query.auth) ? req.query.auth.join("/") : "";
  const path = authMap[slug];

  if (!path) {
    res.status(404).json({ message: "Rota de autenticação não encontrada" });
    return;
  }

  return proxyToBackend(req, res, path);
}
