"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSettings } from "@/lib/settings-context";

gsap.registerPlugin(ScrollTrigger);

type Tag = "h1" | "h2" | "h3" | "p";

/**
 * Splits text into words, each masked and translated down by CSS
 * (.reveal-word / .reveal-word-mask in globals.css, so there is no
 * flash-of-visible-text before JS runs), then GSAP staggers them up into
 * place once the element is in view. Runs once (scroll triggered, but an
 * element already in the viewport on mount — like the hero — animates in
 * immediately).
 */
export function StaggerText({
  text,
  as: Tag = "h1",
  className,
  delay = 0,
}: {
  text: string;
  as?: Tag;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLElement>(null);
  const { reducedMotion } = useSettings();
  const words = text.split(" ");

  useLayoutEffect(() => {
    if (!ref.current || reducedMotion) return;
    const targets = ref.current.querySelectorAll<HTMLElement>(".reveal-word");

    // set the hidden state through GSAP itself (not the CSS class alone):
    // getComputedStyle resolves a % translate to a pixel matrix, so GSAP
    // can't recover yPercent from CSS and a yPercent tween becomes a no-op.
    const ctx = gsap.context(() => {
      gsap.set(targets, { yPercent: 112, opacity: 0 });
      gsap.to(targets, {
        yPercent: 0,
        opacity: 1,
        duration: 0.9,
        stagger: 0.045,
        ease: "power4.out",
        delay,
        scrollTrigger: {
          trigger: ref.current,
          start: "top 92%",
          once: true,
        },
      });
    });

    return () => {
      ctx.revert();
      gsap.set(targets, { clearProps: "opacity,transform" });
    };
  }, [reducedMotion, delay]);

  return (
    <Tag ref={ref as never} className={className}>
      {words.map((w, i) => (
        <span className="reveal-word-mask" key={i}>
          <span className="reveal-word">{w}</span>
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </Tag>
  );
}
