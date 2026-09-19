"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSettings } from "@/lib/settings-context";

gsap.registerPlugin(ScrollTrigger);

/**
 * Drives Lenis off GSAP's own ticker (rather than a separate rAF loop) and
 * feeds every Lenis tick back into ScrollTrigger.update, which is the
 * integration Lenis documents for use alongside ScrollTrigger. Skipped
 * entirely under prefers-reduced-motion: native scroll is already the
 * right behavior there.
 */
export function SmoothScroll() {
  const { reducedMotion } = useSettings();

  useEffect(() => {
    if (reducedMotion) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => 1 - Math.pow(1 - t, 3),
    });

    lenis.on("scroll", ScrollTrigger.update);

    const tickerFn = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tickerFn);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tickerFn);
      lenis.destroy();
    };
  }, [reducedMotion]);

  return null;
}
