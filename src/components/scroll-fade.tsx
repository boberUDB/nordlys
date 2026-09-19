"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSettings } from "@/lib/settings-context";

gsap.registerPlugin(ScrollTrigger);

/**
 * Lifts its content and fades it out as the section scrolls away, so the 3D world
 * behind takes the stage. Scrubbed: it is tied to the scrollbar, not to a timer.
 */
export function ScrollFade({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { reducedMotion } = useSettings();

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion) return;
    const ctx = gsap.context(() => {
      gsap.to(el, {
        y: -70,
        opacity: 0,
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top 18%",
          end: () => `+=${window.innerHeight * 0.55}`,
          scrub: true,
        },
      });
    });
    return () => {
      ctx.revert();
      gsap.set(el, { clearProps: "opacity,transform" });
    };
  }, [reducedMotion]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
