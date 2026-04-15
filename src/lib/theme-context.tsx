import { createContext, ReactNode, useContext, useEffect, useState } from "react";

type Theme = "dark" | "soft";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const themes = [
  { id: "dark", label: "Dark", emoji: "🌙" },
  { id: "soft", label: "Soft", emoji: "🌸" },
];

const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  setTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<Theme>("dark");

  useEffect(() => {
    const stored = localStorage.getItem("auraspace-theme") as Theme;
    if (stored) setThemeState(stored);
  }, []);

  useEffect(() => {
    localStorage.setItem("auraspace-theme", theme);

    const root = document.documentElement;

    if (theme === "soft") {
      root.classList.add("theme-soft");
    } else {
      root.classList.remove("theme-soft");
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme: setThemeState }}>
      {children}
    </ThemeContext.Provider>
  );
};