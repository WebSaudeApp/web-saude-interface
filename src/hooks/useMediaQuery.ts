import { useEffect, useState } from "react";

// Matches a CSS media query. False on the server and on the first client
// render, so markup only changes after hydration (no mismatch).
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const list = window.matchMedia(query);
    setMatches(list.matches);
    function handleChange(event: MediaQueryListEvent) {
      setMatches(event.matches);
    }
    list.addEventListener("change", handleChange);
    return () => list.removeEventListener("change", handleChange);
  }, [query]);

  return matches;
}
