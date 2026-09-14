import { useEffect, useState } from "react";

const FAVORITES_KEY = "web-saude-favs";

function readFavorites(): string[] {
  try {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function useFavorite(id: string) {
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    setIsFavorite(readFavorites().includes(id));
  }, [id]);

  function toggle() {
    const favorites = readFavorites();
    const index = favorites.indexOf(id);
    if (index >= 0) {
      favorites.splice(index, 1);
    } else {
      favorites.push(id);
    }
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    setIsFavorite(favorites.includes(id));
  }

  return [isFavorite, toggle] as const;
}
