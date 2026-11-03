export type IpPlace = {
  city: string;
  uf: string;
};

/**
 * Approximate city and state of the visitor's connection, or null when the
 * server has none to offer (no result, not in Brazil, or not on Vercel).
 * The IP itself never reaches the browser or our code.
 */
export async function fetchIpPlace(): Promise<IpPlace | null> {
  try {
    const response = await fetch("/api/ip-location");
    if (response.status !== 200) {
      return null;
    }
    return (await response.json()) as IpPlace;
  } catch {
    return null;
  }
}
