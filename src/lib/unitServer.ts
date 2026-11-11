import { backendUrl } from "@/lib/backendProxy";
import Logger from "@/services/Logger";
import type { ApiEstabelecimento } from "@/types/Api";

// Short on purpose: while the API wakes up (free Render plan) the page must
// not hold its HTML back. It falls back to fetching in the browser instead.
const UNIT_TIMEOUT_MS = 5000;

export type UnitLookup =
  | { status: "ok"; unit: ApiEstabelecimento }
  | { status: "notfound" }
  | { status: "unavailable" };

/** Server-side only: one unit straight from the API, for the page's HTML. */
export async function lookupUnit(id: string): Promise<UnitLookup> {
  try {
    const response = await fetch(
      `${backendUrl}/estabelecimentos/${encodeURIComponent(id)}`,
      { signal: AbortSignal.timeout(UNIT_TIMEOUT_MS) },
    );
    if (response.status === 404) {
      return { status: "notfound" };
    }
    if (!response.ok) {
      return { status: "unavailable" };
    }
    return {
      status: "ok",
      unit: (await response.json()) as ApiEstabelecimento,
    };
  } catch (error) {
    Logger.error(
      "Falha ao buscar a unidade no servidor",
      error instanceof Error ? `${error.name}: ${error.message}` : error,
    );
    return { status: "unavailable" };
  }
}
