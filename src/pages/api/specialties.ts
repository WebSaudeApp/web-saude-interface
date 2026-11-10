import type { NextApiRequest, NextApiResponse } from "next";
import { MAX_DURATION_SECONDS, proxyToBackend } from "@/lib/backendProxy";

// Vercel stops the function at its own limit, so it must outlast the proxy's.
export const config = { maxDuration: MAX_DURATION_SECONDS };

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return proxyToBackend(req, res, "/especialidades");
}
