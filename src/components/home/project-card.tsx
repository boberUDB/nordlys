"use client";

import { useRef } from "react";
import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react";
import type { Project } from "@/lib/projects";
import { ProjectArt } from "@/components/project-art";

type Vars = React.CSSProperties & Record<`--${string}`, string>;

/**
 * A project card with a spotlight that follows the pointer, cover art that drifts against it
 * (parallax) and a call to action that fills with the project's colour on hover.
 */
export function ProjectCard({ p, hidden }: { p: Project; hidden?: boolean }) {
  const ref = useRef<HTMLAnchorElement>(null);

  function onMove(e: React.PointerEvent<HTMLAnchorElement>) {
    const el = ref.current;
    if (!el || e.pointerType !== "mouse") return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
    el.style.setProperty("--px", String((e.clientX - r.left) / r.width - 0.5));
    el.style.setProperty("--py", String((e.clientY - r.top) / r.height - 0.5));
  }
  function onLeave() {
    ref.current?.style.setProperty("--px", "0");
    ref.current?.style.setProperty("--py", "0");
  }

  const style: Vars = {
    "--tint": p.tint,
    color: p.tint,
    borderColor: "var(--line-strong)",
    background: `linear-gradient(160deg, color-mix(in srgb, ${p.tint} 16%, var(--bg-elevated)) 0%, color-mix(in srgb, var(--bg-elevated) 78%, transparent) 62%)`,
  };

  return (
    <Link
      ref={ref}
      href={`/work#${p.slug}`}
      draggable={false}
      tabIndex={hidden ? -1 : undefined}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className="group relative flex h-[min(62svh,560px)] w-[min(82vw,480px)] flex-col justify-between overflow-hidden rounded-[var(--radius-md)] border p-6 backdrop-blur-md transition-[border-color,box-shadow] duration-500 hover:border-[var(--tint)] hover:shadow-[0_40px_90px_-40px_var(--tint)]"
      style={style}
    >
      {/* spotlight that follows the pointer */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `radial-gradient(380px circle at var(--mx, 50%) var(--my, 30%), color-mix(in srgb, ${p.tint} 24%, transparent), transparent 62%)`,
        }}
      />

      {/* oversized index, outlined, behind everything */}
      <span
        aria-hidden
        className="display pointer-events-none absolute -right-3 -top-8 select-none text-[11rem] opacity-45 transition-opacity duration-500 group-hover:opacity-90"
        style={{ color: "transparent", WebkitTextStroke: "1.5px currentColor" }}
      >
        {p.index}
      </span>

      <div className="relative z-10 flex items-start justify-between font-mono text-sm text-[var(--text-muted)]">
        <span>{p.index}</span>
        <span>{p.year}</span>
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-[13%] h-[44%] transition-transform duration-300 ease-out"
        style={{ transform: "translate3d(calc(var(--px, 0) * -18px), calc(var(--py, 0) * -12px), 0)" }}
      >
        <ProjectArt
          slug={p.slug}
          className="h-full w-full scale-100 opacity-90 transition-transform duration-700 ease-[var(--ease-out)] group-hover:scale-[1.08]"
        />
      </div>

      <div className="relative z-10">
        <h3 className="display text-[clamp(2.4rem,4.2vw,3.6rem)] text-[var(--text)]">{p.name}</h3>
        <p className="mt-3 line-clamp-3 max-w-[38ch] text-sm leading-relaxed text-[var(--text-muted)]">
          {p.summary}
        </p>
        <div className="mt-5 flex items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5">
            {p.disciplines.map((d) => (
              <span
                key={d}
                className="rounded-full border px-2.5 py-1 text-[11px] text-[var(--text-muted)]"
                style={{ borderColor: "var(--line-strong)" }}
              >
                {d}
              </span>
            ))}
          </div>
          <span
            className="flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium text-[var(--text)] transition-all duration-300 group-hover:gap-2.5 group-hover:bg-[var(--tint)] group-hover:text-[#07070a]"
            style={{ borderColor: "var(--line-strong)" }}
          >
            Ver
            <ArrowUpRight size={13} weight="bold" />
          </span>
        </div>
      </div>
    </Link>
  );
}
