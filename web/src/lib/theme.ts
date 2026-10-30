import { useCallback, useEffect, useState } from "react";

export type Theme = "light" | "dark";

const STORAGE_KEY = "theme";

function systemTheme(): Theme {
  return typeof window.matchMedia === "function" && window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

/** Explicit choice saved in this browser, or null to follow the system. */
function storedTheme(): Theme | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === "light" || value === "dark" ? value : null;
  } catch {
    return null;
  }
}

export function resolvedTheme(): Theme {
  return storedTheme() ?? systemTheme();
}

export function applyTheme(theme: Theme = resolvedTheme()) {
  document.documentElement.dataset.theme = theme;
}

/** Current theme plus a setter that persists the choice in this browser. */
export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(resolvedTheme);

  useEffect(() => {
    // Follow system changes while the user has not chosen explicitly.
    if (typeof window.matchMedia !== "function") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (!storedTheme()) {
        const next = systemTheme();
        applyTheme(next);
        setThemeState(next);
      }
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const setTheme = useCallback((next: Theme) => {
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Storage unavailable: the choice lasts for this page only.
    }
    applyTheme(next);
    setThemeState(next);
  }, []);

  return { theme, setTheme };
}
