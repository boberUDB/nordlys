"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSettings } from "@/lib/settings-context";

gsap.registerPlugin(ScrollTrigger);

/**
 * Fade + slide reveal on scroll into view. Wrap a list's children in a
 * single Reveal with `stagger` to cascade them, or wrap one element on its
 * own. Viewport-triggered (once), not scrubbed — this is a moment, not a
 * scroll-linked transform.
 */
export function Reveal({
  children,
  className,
  stagger = 0,
  y = 28,
  delay = 0,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
  y?: number;
  delay?: number;
  as?: "div" | "ul";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { reducedMotion } = useSettings();

  useLayoutEffect(() => {
    if (!ref.current || reducedMotion) return;
    const targets = stagger > 0 ? Array.from(ref.current.children) : [ref.current];

    const ctx = gsap.context(() => {
      // set inside the context so revert() (e.g. when reduced motion turns on
      // after hydration) restores the elements instead of leaving them hidden
      gsap.set(targets, { opacity: 0, y });
      gsap.to(targets, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power3.out",
        stagger,
        delay,
        scrollTrigger: {
          trigger: ref.current,
          start: "top 88%",
          once: true,
        },
      });
    });

    return () => {
      ctx.revert();
      // revert() alone can leave the hidden state behind when a ScrollTrigger
      // tween never played, so clear the inline styles explicitly
      gsap.set(targets, { clearProps: "opacity,transform" });
    };
  }, [reducedMotion, stagger, y, delay]);

  return (
    <Tag ref={ref as never} className={className}>
      {children}
    </Tag>
  );
}
