import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";

export const THEME_STORAGE_KEY = "web-saude-theme";

type Theme = "light" | "dark";

type ThemeContextValue = {
  theme: Theme;
  resolvedTheme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: PropsWithChildren) {
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "dark" || stored === "light") {
      setThemeState(stored);
      document.documentElement.dataset.theme = stored;
    }
  }, []);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    window.localStorage.setItem(THEME_STORAGE_KEY, next);
    document.documentElement.dataset.theme = next;
  }, []);

  const value = useMemo(
    () => ({ theme, resolvedTheme: theme, setTheme }),
    [theme, setTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme precisa estar dentro de ThemeProvider");
  }
  return context;
}
