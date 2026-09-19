"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useSettings } from "@/lib/settings-context";

/**
 * Giant type strip that drifts on its own and reacts to scroll velocity: it speeds up,
 * follows the scroll direction and skews with the push. Driven by GSAP's ticker so it
 * shares a clock with Lenis and never runs a second rAF loop.
 */
export function Marquee({ items }: { items: string[] }) {
  const track = useRef<HTMLDivElement>(null);
  const { reducedMotion } = useSettings();

  useEffect(() => {
    const el = track.current;
    if (!el || reducedMotion) return;

    let x = 0;
    let dir = -1;
    let skew = 0;
    let lastY = window.scrollY;

    const tick = (_t: number, dtMs: number) => {
      const y = window.scrollY;
      const v = y - lastY;
      lastY = y;
      if (Math.abs(v) > 0.5) dir = v > 0 ? -1 : 1;

      const boost = Math.min(Math.abs(v), 90) * 0.55;
      x += dir * (70 * (dtMs / 1000) + boost);
      const half = el.scrollWidth / 2;
      if (x <= -half) x += half;
      if (x > 0) x -= half;

      const targetSkew = Math.max(-9, Math.min(9, -v * 0.12));
      skew += (targetSkew - skew) * 0.12;
      el.style.transform = `translate3d(${x}px,0,0) skewX(${skew}deg)`;
    };

    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, [reducedMotion]);

  const row = (key: string) => (
    <div key={key} className="flex shrink-0 items-center" aria-hidden={key !== "a"}>
      {items.map((word, i) => (
        <span key={word} className="flex items-center">
          <span
            className={`display px-6 text-[clamp(3.6rem,11vw,10rem)] ${i % 2 ? "text-outline" : "text-[var(--text)]"}`}
          >
            {word}
          </span>
          <span
            aria-hidden
            className="h-3 w-3 shrink-0 rounded-full sm:h-4 sm:w-4"
            style={{ background: "var(--aurora)" }}
          />
        </span>
      ))}
    </div>
  );

  return (
    <div className="relative overflow-hidden py-10 sm:py-14" role="presentation">
      <div ref={track} className="flex w-max will-change-transform">
        {row("a")}
        {row("b")}
      </div>
    </div>
  );
}
