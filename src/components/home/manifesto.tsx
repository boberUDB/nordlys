"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSettings } from "@/lib/settings-context";
import { Reveal } from "@/components/reveal";

gsap.registerPlugin(ScrollTrigger);

/** [text, highlighted] */
const WORDS: [string, boolean][] = [
  ["Un", false], ["estudio", false], ["pequeño,", false], ["a", false], ["propósito.", false],
  ["La", false], ["misma", false], ["persona", false], ["que", false], ["diseña", false], ["la", false],
  ["interacción", false], ["es", false], ["la", false], ["que", false], ["la", false], ["construye,", false],
  ["y", false], ["por", false], ["eso", false], ["las", true], ["ideas", true], ["no", true], ["se", true],
  ["pierden", true], ["en", false], ["el", false], ["camino.", false],
];

const STATS = [
  { value: "2021", label: "Año en que empezamos" },
  { value: "4", label: "Personas, sin intermediarios" },
  { value: "6", label: "Proyectos en el portafolio" },
  { value: "2 días", label: "Para responderte" },
];

/** Big statement whose words light up one by one as it crosses the screen, plus a stats row. */
export function Manifesto() {
  const text = useRef<HTMLParagraphElement>(null);
  const { reducedMotion } = useSettings();

  useLayoutEffect(() => {
    const el = text.current;
    if (!el || reducedMotion) return;
    const words = el.querySelectorAll<HTMLElement>("[data-w]");

    const ctx = gsap.context(() => {
      gsap.fromTo(
        words,
        { opacity: 0.12 },
        {
          opacity: 1,
          ease: "none",
          stagger: 0.1,
          scrollTrigger: { trigger: el, start: "top 78%", end: "bottom 42%", scrub: true },
        }
      );
    });
    return () => {
      ctx.revert();
      gsap.set(words, { clearProps: "opacity" });
    };
  }, [reducedMotion]);

  return (
    <section data-story="manifesto" className="relative flex min-h-[130svh] flex-col justify-center py-32">
      <div className="mx-auto w-full max-w-[1400px] px-5 sm:px-8">
        <p
          ref={text}
          className="display max-w-[22ch] text-[clamp(2.1rem,5.6vw,5.4rem)] text-[var(--text)] sm:max-w-[26ch]"
        >
          {WORDS.map(([w, hi], i) => (
            <span
              key={i}
              data-w
              className="inline-block"
              style={hi ? { color: "var(--accent)" } : undefined}
            >
              {w}
              {i < WORDS.length - 1 ? " " : ""}
            </span>
          ))}
        </p>

        <Reveal
          stagger={0.1}
          className="mt-24 grid grid-cols-2 gap-x-6 gap-y-10 border-t pt-10 md:grid-cols-4"
        >
          {STATS.map((s) => (
            <div key={s.label}>
              <div className="display text-[clamp(2.2rem,4.4vw,3.8rem)] text-[var(--text)]">{s.value}</div>
              <div className="mt-3 max-w-[20ch] text-sm text-[var(--text-muted)]">{s.label}</div>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
