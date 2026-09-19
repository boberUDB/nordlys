"use client";

import { useState } from "react";
import { ArrowUpRight } from "@phosphor-icons/react";
import { projects } from "@/lib/projects";
import { Reveal } from "@/components/reveal";
import { story } from "@/lib/story";

const PREVIEW_W = 320;
const PREVIEW_H = 240;

export function WorkList() {
  const [hovered, setHovered] = useState<string | null>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const active = projects.find((p) => p.slug === hovered) ?? null;

  return (
    <div
      className="relative"
      data-sound="reveal"
      onMouseMove={(e) => setPos({ x: e.clientX, y: e.clientY })}
    >
      <Reveal as="ul" stagger={0.08} y={22}>
        {projects.map((p) => (
          <li
            key={p.slug}
            id={p.slug}
            className="scroll-mt-[calc(var(--nav-h)+24px)] border-t last:border-b"
            style={{ borderColor: "var(--line)" }}
          >
            <button
              type="button"
              onMouseEnter={() => {
                setHovered(p.slug);
                story.tint = p.tint;
              }}
              onMouseLeave={() => setHovered(null)}
              className="grid w-full grid-cols-[auto_1fr] items-baseline gap-x-6 gap-y-2 py-8 text-left transition-colors sm:grid-cols-[64px_1fr_auto_auto] sm:items-center"
            >
              <span className="font-mono text-sm text-[var(--text-faint)]">
                {p.index}
              </span>
              <span
                className="text-3xl font-medium tracking-tight text-[var(--text)] transition-colors sm:text-4xl"
                style={{ color: hovered === p.slug ? "var(--accent)" : undefined }}
              >
                {p.name}
              </span>
              <span className="col-span-2 text-sm text-[var(--text-muted)] sm:col-span-1 sm:text-right">
                {p.disciplines.join(" · ")}
              </span>
              {/* no hover on touch / narrow screens, so the summary shows inline there */}
              <span className="col-span-2 mt-1 max-w-[56ch] text-sm leading-relaxed text-[var(--text-muted)] sm:col-span-4 lg:hidden">
                {p.summary}
              </span>
              <span className="hidden items-center gap-2 font-mono text-sm text-[var(--text-faint)] sm:flex">
                {p.year}
                <ArrowUpRight size={16} />
              </span>
            </button>
          </li>
        ))}
      </Reveal>

      {/* cursor-anchored preview, desktop hover only */}
      <div
        aria-hidden
        className="pointer-events-none fixed z-40 hidden h-[240px] w-[320px] overflow-hidden rounded-[var(--radius-md)] transition-[opacity,transform] duration-200 ease-out lg:block"
        style={{
          // flip to the left of the pointer / clamp so the card never leaves the viewport
          left:
            typeof window !== "undefined" && pos.x + 28 + PREVIEW_W > window.innerWidth - 16
              ? pos.x - 28 - PREVIEW_W
              : pos.x + 28,
          top:
            typeof window !== "undefined"
              ? Math.min(Math.max(pos.y - PREVIEW_H / 2, 88), window.innerHeight - PREVIEW_H - 16)
              : pos.y - PREVIEW_H / 2,
          opacity: active ? 1 : 0,
          transform: active ? "scale(1)" : "scale(0.92)",
        }}
      >
        {active && <ProjectPreview tint={active.tint} summary={active.summary} />}
      </div>
    </div>
  );
}

function ProjectPreview({ tint, summary }: { tint: string; summary: string }) {
  return (
    <div
      className="relative h-full w-full border"
      style={{
        borderColor: "var(--line-strong)",
        background: `radial-gradient(120% 100% at 20% 10%, ${tint}55, transparent 60%), var(--bg-elevated)`,
      }}
    >
      <div className="absolute inset-0 p-4">
        <p className="text-xs leading-relaxed text-[var(--text)]" style={{ opacity: 0.85 }}>
          {summary}
        </p>
      </div>
    </div>
  );
}
