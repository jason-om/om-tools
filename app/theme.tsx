"use client";

import { useCallback, useSyncExternalStore } from "react";
import { MoonIcon, SunIcon } from "./icons";

const KEY = "om-theme";
const EVENT = "om-theme-change";

/** Runs before first paint so the stored choice never flashes the wrong theme.
 *  Kept in sync with `readTheme` below. */
export const THEME_BOOTSTRAP = `try{var t=localStorage.getItem("${KEY}");document.documentElement.dataset.theme=t==="dark"||t==="light"?t:(window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light")}catch(e){}`;

type Theme = "light" | "dark";

/** The applied theme lives on <html>, put there by the bootstrap script above.
 *  Reading it back through a store keeps hydration honest: the server snapshot
 *  is "light", and React reconciles once the client subscribes. */
function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

function readTheme(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

const serverTheme = (): Theme => "light";

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, readTheme, serverTheme);

  const toggle = useCallback(() => {
    const next: Theme = readTheme() === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(KEY, next);
    } catch {
      // Private-mode storage denial is not worth failing the toggle over.
    }
    window.dispatchEvent(new Event(EVENT));
  }, []);

  const label = theme === "dark" ? "Switch to light mode" : "Switch to dark mode";

  return (
    <button
      className="theme-toggle"
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
    >
      {theme === "dark" ? <SunIcon size={19} /> : <MoonIcon size={19} />}
    </button>
  );
}
