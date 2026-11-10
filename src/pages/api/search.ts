import type { NextApiRequest, NextApiResponse } from "next";
import { proxyToBackend } from "@/lib/backendProxy";

// Next only reads a literal here. Must stay above the proxy timeout
// (`BACKEND_TIMEOUT_MS` in lib/backendProxy.ts).
export const config = { maxDuration: 60 };

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return proxyToBackend(req, res, "/estabelecimentos");
}
