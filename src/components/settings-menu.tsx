"use client";

import { useEffect, useRef, useState } from "react";
import {
  GearSix,
  SpeakerSimpleHigh,
  SpeakerSimpleSlash,
  Sun,
  MoonStars,
  Check,
} from "@phosphor-icons/react";
import { useSettings, type Quality } from "@/lib/settings-context";
import { sound } from "@/lib/sound";

const QUALITY_OPTIONS: { value: Quality; label: string }[] = [
  { value: "high", label: "Alta" },
  { value: "medium", label: "Media" },
  { value: "low", label: "Baja" },
];

export function SettingsMenu() {
  const {
    theme,
    setTheme,
    soundOn,
    setSoundOn,
    quality,
    setQuality,
    motion,
    setMotion,
    systemReducedMotion,
  } = useSettings();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label="Configuración"
        className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--line)] text-[var(--text-muted)] transition-colors hover:border-[var(--line-strong)] hover:text-[var(--text)]"
      >
        <GearSix size={18} weight="regular" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+10px)] w-64 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--bg-elevated)] p-2 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)]"
        >
          <SettingRow label="Sonido">
            <ToggleButton
              pressed={soundOn}
              onClick={() => {
                const next = !soundOn;
                setSoundOn(next);
                if (next) sound.on(); // inside the click, so the browser lets the audio start
              }}
              onIcon={<SpeakerSimpleHigh size={15} weight="bold" />}
              offIcon={<SpeakerSimpleSlash size={15} weight="bold" />}
            />
          </SettingRow>

          <SettingRow label="Tema">
            <div className="flex gap-1">
              <ThemeButton
                active={theme === "dark"}
                onClick={() => setTheme("dark")}
                icon={<MoonStars size={14} weight="bold" />}
                label="Oscuro"
              />
              <ThemeButton
                active={theme === "light"}
                onClick={() => setTheme("light")}
                icon={<Sun size={14} weight="bold" />}
                label="Claro"
              />
            </div>
          </SettingRow>

          <div className="px-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--text)]">Animaciones</span>
              <div className="flex gap-1">
                {(
                  [
                    ["full", "Completas"],
                    ["reduced", "Reducidas"],
                  ] as const
                ).map(([value, label]) => {
                  const active = (motion === "system" ? (systemReducedMotion ? "reduced" : "full") : motion) === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setMotion(value)}
                      className="rounded-[var(--radius-sm)] border px-2 py-1 text-xs transition-colors"
                      style={{
                        borderColor: active ? "var(--accent)" : "var(--line)",
                        color: active ? "var(--accent)" : "var(--text-muted)",
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
            {motion === "system" && systemReducedMotion && (
              <p className="mt-2 text-[11px] leading-snug text-[var(--text-faint)]">
                Tu sistema pide reducir el movimiento, por eso empezaron reducidas.
              </p>
            )}
          </div>

          <div className="px-3 pb-2 pt-3">
            <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--text-faint)]">
              Calidad gráfica
            </span>
            <div className="mt-2 flex flex-col gap-1">
              {QUALITY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setQuality(opt.value)}
                  className="flex items-center justify-between rounded-[var(--radius-sm)] px-2 py-1.5 text-left text-sm text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-elevated-2)] hover:text-[var(--text)]"
                >
                  {opt.label}
                  {quality === opt.value && (
                    <Check size={14} weight="bold" className="text-[var(--accent)]" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SettingRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-3 py-2">
      <span className="text-sm text-[var(--text)]">{label}</span>
      {children}
    </div>
  );
}

function ToggleButton({
  pressed,
  onClick,
  onIcon,
  offIcon,
}: {
  pressed: boolean;
  onClick: () => void;
  onIcon: React.ReactNode;
  offIcon: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={pressed}
      onClick={onClick}
      className="flex h-7 w-12 items-center rounded-[var(--radius-pill)] border border-[var(--line-strong)] px-[3px] transition-colors"
      style={{ justifyContent: pressed ? "flex-end" : "flex-start" }}
    >
      <span
        className="flex h-5 w-5 items-center justify-center rounded-full transition-colors"
        style={{
          background: pressed ? "var(--accent)" : "var(--bg-elevated-2)",
          color: pressed ? "var(--accent-ink)" : "var(--text-faint)",
        }}
      >
        {pressed ? onIcon : offIcon}
      </span>
    </button>
  );
}

function ThemeButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={label}
      className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-sm)] border transition-colors"
      style={{
        borderColor: active ? "var(--accent)" : "var(--line)",
        color: active ? "var(--accent)" : "var(--text-faint)",
      }}
    >
      {icon}
    </button>
  );
}
