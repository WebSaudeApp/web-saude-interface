import type { NextApiRequest, NextApiResponse } from "next";
import { proxyToBackend } from "@/lib/backendProxy";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = String(req.query.id ?? "");
  return proxyToBackend(req, res, `/unidades/${id}`);
}
