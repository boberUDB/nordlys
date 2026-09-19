"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSettings } from "@/lib/settings-context";

gsap.registerPlugin(ScrollTrigger);

/** Moves its child vertically against the scroll: `speed` is a fraction of its own height. */
export function Parallax({
  children,
  className,
  speed = 0.25,
}: {
  children: React.ReactNode;
  className?: string;
  speed?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { reducedMotion } = useSettings();

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { yPercent: -speed * 100 },
        {
          yPercent: speed * 100,
          ease: "none",
          scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
        }
      );
    });
    return () => {
      ctx.revert();
      gsap.set(el, { clearProps: "transform" });
    };
  }, [reducedMotion, speed]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
