"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react";
import { story } from "@/lib/story";
import { Reveal } from "@/components/reveal";
import { Magnetic } from "@/components/magnetic";

/**
 * Closing call to action. Hovering the giant link pulls the 3D shards in toward the crystal
 * (story.attract), so the page answers the pointer before it is even clicked.
 */
export function Closing() {
  useEffect(() => () => void (story.attract = 0), []);

  return (
    <section
      data-story="cta"
      className="relative flex min-h-[100svh] flex-col items-center justify-end px-5 pb-20 pt-32 text-center sm:px-8"
    >
      <Reveal className="flex flex-col items-center">
        <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--text-faint)]">
          ¿Tienes algo difícil de copiar en mente?
        </span>
        <Link
          href="/contact"
          onPointerEnter={() => (story.attract = 1)}
          onPointerLeave={() => (story.attract = 0)}
          onFocus={() => (story.attract = 1)}
          onBlur={() => (story.attract = 0)}
          className="display group mt-6 inline-flex items-center gap-4 text-[clamp(3.6rem,15vw,14rem)] text-[var(--text)] transition-[letter-spacing] duration-500 ease-[var(--ease-out)] hover:tracking-[-0.02em]"
        >
          <span className="transition-colors duration-300 group-hover:text-[var(--accent)]">Hablemos.</span>
          <ArrowUpRight
            weight="light"
            className="h-[0.5em] w-[0.5em] shrink-0 -translate-x-2 translate-y-2 text-[var(--accent)] opacity-0 transition-all duration-500 ease-[var(--ease-out)] group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100"
          />
        </Link>
        <div className="mt-12">
          <Magnetic>
            <a
              href="mailto:studio@nordlys.work"
              className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] border px-6 py-3.5 text-sm font-medium text-[var(--text)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
              style={{ borderColor: "var(--line-strong)" }}
            >
              studio@nordlys.work
              <ArrowUpRight size={14} weight="bold" />
            </a>
          </Magnetic>
        </div>
      </Reveal>
    </section>
  );
}
