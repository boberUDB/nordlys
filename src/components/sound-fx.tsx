"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useSettings } from "@/lib/settings-context";
import { sound } from "@/lib/sound";

const INTERACTIVE = "a, button, [role='switch'], input, textarea, select";

/**
 * The sound layer. Only active while "Sonido" is on: a glass tick on hover, a soft thud on
 * click, and a thaw swoosh for page transitions and for content that is revealed
 * (anything marked data-sound="reveal").
 */
export function SoundFx() {
  const { soundOn } = useSettings();
  const pathname = usePathname();
  const lastPath = useRef(pathname);
  const seen = useRef(new WeakSet<Element>());

  useEffect(() => {
    if (!soundOn) return;
    let last: Element | null = null;

    function onOver(e: PointerEvent) {
      const el = (e.target as HTMLElement | null)?.closest?.(INTERACTIVE) ?? null;
      if (el && el !== last) sound.hover();
      last = el;
    }
    function onDown(e: PointerEvent) {
      if ((e.target as HTMLElement | null)?.closest?.(INTERACTIVE)) sound.click();
    }
    document.addEventListener("pointerover", onOver, { passive: true });
    document.addEventListener("pointerdown", onDown, { passive: true });
    return () => {
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [soundOn]);

  // page transition
  useEffect(() => {
    if (lastPath.current !== pathname) {
      lastPath.current = pathname;
      if (soundOn) sound.swoosh();
    }
  }, [pathname, soundOn]);

  // reveals
  useEffect(() => {
    if (!soundOn) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && !seen.current.has(e.target)) {
            seen.current.add(e.target);
            sound.swoosh();
          }
        }
      },
      { threshold: 0.4 }
    );
    document.querySelectorAll("[data-sound='reveal']").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [soundOn, pathname]);

  return null;
}
