import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

type ThemeContextType = {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggle: () => void;
};

const THEME_KEY = "theme";

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

function applyThemeClass(theme: Theme) {
  if (theme === "dark") {
    document.documentElement.classList.add("dark");
  } else if (theme === "light") {
    document.documentElement.classList.remove("dark");
  } else {
    // system
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }
}

export const ThemeProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      const raw = localStorage.getItem(THEME_KEY) as Theme | null;
      return raw ?? "system";
    } catch {
      return "system";
    }
  });

  useEffect(() => {
    applyThemeClass(theme);

    const mq = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => applyThemeClass(theme);
    // Re-apply on system changes only when theme === 'system'
    if (mq && theme === 'system') {
      mq.addEventListener ? mq.addEventListener('change', handler) : mq.addListener(handler as any);
    }

    return () => {
      if (mq) mq.removeEventListener ? mq.removeEventListener('change', handler) : mq.removeListener(handler as any);
    };
  }, [theme]);

  const setTheme = (t: Theme) => {
    try {
      localStorage.setItem(THEME_KEY, t);
    } catch {}
    setThemeState(t);
  };

  const toggle = () => {
    setThemeState((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch {}
      applyThemeClass(next);
      return next;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
