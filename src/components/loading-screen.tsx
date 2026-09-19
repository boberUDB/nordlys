"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useLoadingProgress } from "@/lib/use-loading-progress";
import { useSettings } from "@/lib/settings-context";
import { sound, type Pad } from "@/lib/sound";

export function LoadingScreen() {
  const { progress, done } = useLoadingProgress();
  const { reducedMotion, soundOn } = useSettings();
  const [mounted, setMounted] = useState(true);

  const rootRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLDivElement>(null);
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.style.overflow = mounted ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mounted]);

  // loading pad: swells with the counter, resolves into a chord as the curtain opens
  const pad = useRef<Pad | null>(null);
  const doneRef = useRef(false);
  useEffect(() => {
    if (!soundOn || doneRef.current) return;
    const p = sound.startPad();
    pad.current = p;
    return () => {
      p?.stop();
      if (pad.current === p) pad.current = null;
    };
  }, [soundOn]);
  useEffect(() => {
    pad.current?.setProgress(progress / 100);
  }, [progress, soundOn]);

  useEffect(() => {
    if (!done) return;
    doneRef.current = true;
    pad.current?.resolve();
    pad.current = null;

    const ctx = gsap.context(() => {
      if (reducedMotion) {
        gsap.to(rootRef.current, {
          opacity: 0,
          duration: 0.35,
          onComplete: () => setMounted(false),
        });
        return;
      }

      const tl = gsap.timeline({ onComplete: () => setMounted(false) });
      tl.to(counterRef.current, {
        opacity: 0,
        y: -14,
        duration: 0.45,
        ease: "power2.out",
      })
        .to(
          leftPanelRef.current,
          { xPercent: -100, duration: 0.95, ease: "power4.inOut" },
          "-=0.1"
        )
        .to(
          rightPanelRef.current,
          { xPercent: 100, duration: 0.95, ease: "power4.inOut" },
          "<"
        );
    }, rootRef);

    return () => ctx.revert();
  }, [done, reducedMotion]);

  if (!mounted) return null;

  return (
    <div ref={rootRef} className="fixed inset-0 z-[200]" aria-hidden={done}>
      <div
        ref={leftPanelRef}
        className="absolute inset-y-0 left-0 w-1/2"
        style={{ background: "var(--bg)" }}
      />
      <div
        ref={rightPanelRef}
        className="absolute inset-y-0 right-0 w-1/2"
        style={{ background: "var(--bg)" }}
      />

      <div
        ref={counterRef}
        className="absolute inset-0 flex flex-col items-center justify-center gap-5"
      >
        <span
          aria-hidden
          className="h-2.5 w-2.5 rounded-full"
          style={{ background: "var(--aurora)" }}
        />
        <span
          className="font-mono text-sm tabular-nums text-[var(--text-muted)]"
          role="status"
          aria-live="polite"
        >
          {progress}%
        </span>
        <div className="h-px w-40 overflow-hidden" style={{ background: "var(--line)" }}>
          <div
            className="h-full w-full origin-left"
            style={{
              transform: `scaleX(${progress / 100})`,
              background: "var(--aurora)",
              transition: "transform 0.2s linear",
            }}
          />
        </div>
      </div>
    </div>
  );
}
