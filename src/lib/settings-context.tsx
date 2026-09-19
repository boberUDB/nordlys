"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type Theme = "dark" | "light";
export type Quality = "high" | "medium" | "low";
/** "system" follows the OS "reduce motion" setting; the other two override it */
export type MotionPref = "system" | "full" | "reduced";

type Settings = {
  theme: Theme;
  setTheme: (t: Theme) => void;
  soundOn: boolean;
  setSoundOn: (v: boolean) => void;
  quality: Quality;
  setQuality: (q: Quality) => void;
  reducedMotion: boolean;
  motion: MotionPref;
  setMotion: (m: MotionPref) => void;
  /** what the operating system asks for, regardless of the override */
  systemReducedMotion: boolean;
};

const SettingsContext = createContext<Settings | null>(null);

const STORAGE_KEY = "nordlys-settings";

function readStoredSettings(): Partial<{
  theme: Theme;
  soundOn: boolean;
  quality: Quality;
  motion: MotionPref;
}> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function detectDefaultQuality(): Quality {
  if (typeof navigator === "undefined") return "high";
  const cores = navigator.hardwareConcurrency ?? 8;
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
  if (cores <= 4 || mem <= 4) return "low";
  if (cores <= 6 || mem <= 6) return "medium";
  return "high";
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [soundOn, setSoundOnState] = useState(false);
  const [quality, setQualityState] = useState<Quality>("high");
  const [systemReduced, setSystemReduced] = useState(false);
  const [motion, setMotionState] = useState<MotionPref>("system");
  const reducedMotion = motion === "system" ? systemReduced : motion === "reduced";

  // hydrate from storage + device capability after mount (avoids SSR mismatch)
  useEffect(() => {
    const stored = readStoredSettings();
    setThemeState(stored.theme ?? "dark");
    setSoundOnState(stored.soundOn ?? false);
    setQualityState(stored.quality ?? detectDefaultQuality());
    setMotionState(stored.motion ?? "system");

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setSystemReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setSystemReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // lets the stylesheet honour the override too (see the reduced-motion rules in globals.css)
  useEffect(() => {
    document.documentElement.setAttribute("data-motion", motion);
  }, [motion]);

  const persist = useCallback(
    (next: Partial<{ theme: Theme; soundOn: boolean; quality: Quality; motion: MotionPref }>) => {
      try {
        const current = readStoredSettings();
        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ ...current, ...next })
        );
      } catch {
        // storage unavailable (private mode, etc.) — settings just won't persist
      }
    },
    []
  );

  const setTheme = useCallback(
    (t: Theme) => {
      setThemeState(t);
      persist({ theme: t });
    },
    [persist]
  );

  const setSoundOn = useCallback(
    (v: boolean) => {
      setSoundOnState(v);
      persist({ soundOn: v });
    },
    [persist]
  );

  const setQuality = useCallback(
    (q: Quality) => {
      setQualityState(q);
      persist({ quality: q });
    },
    [persist]
  );

  const setMotion = useCallback(
    (m: MotionPref) => {
      setMotionState(m);
      persist({ motion: m });
    },
    [persist]
  );

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      soundOn,
      setSoundOn,
      quality,
      setQuality,
      reducedMotion,
      motion,
      setMotion,
      systemReducedMotion: systemReduced,
    }),
    [theme, setTheme, soundOn, setSoundOn, quality, setQuality, reducedMotion, motion, setMotion, systemReduced]
  );

  return (
    <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}
