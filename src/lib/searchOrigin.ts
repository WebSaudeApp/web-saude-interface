// Whether the visitor reached the current page by leaving the search on the
// home page. `document.referrer` cannot tell: client-side navigation never
// updates it. A plain module variable is enough, because a reload or a link
// opened from outside starts from a fresh module, where the answer is "no".
let cameFromSearch = false;

/** Called by the app before each route change, with where it is going. */
export function trackSearchOrigin(from: string, to: string) {
  cameFromSearch = from === "/" && to.startsWith("/units/");
}

export function arrivedFromSearch() {
  return cameFromSearch;
}
