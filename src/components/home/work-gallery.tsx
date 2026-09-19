"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ArrowRight } from "@phosphor-icons/react";
import { projects } from "@/lib/projects";
import { story } from "@/lib/story";
import { useSettings } from "@/lib/settings-context";
import { ProjectCard } from "@/components/home/project-card";
import { Tilt } from "@/components/tilt";
import { Reveal } from "@/components/reveal";

/** px/s the carousel drifts to the right on its own */
const DRIFT = 46;

/**
 * Endless carousel. It drifts to the right by itself, slowly. Press and hold to grab it: it
 * stops under your hand, and dragging moves it 1:1. Let go and it carries your momentum, then
 * eases back to its own pace. The crystal above takes the colour of the card at the centre.
 */
export function WorkGallery() {
  const { reducedMotion, setMotion, systemReducedMotion } = useSettings();
  const section = useRef<HTMLElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const firstSet = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [grabbing, setGrabbing] = useState(false);

  useEffect(() => {
    const vp = viewport.current;
    const tr = track.current;
    const set = firstSet.current;
    const sec = section.current;
    if (!vp || !tr || !set || !sec || reducedMotion) return;

    const st = {
      x: 0,
      v: DRIFT, // current velocity, px/s
      dragging: false,
      lastX: 0,
      lastT: 0,
      moved: 0,
      W: 0,
      onScreen: true,
      frame: 0,
      last: -1,
    };
    const measure = () => (st.W = set.getBoundingClientRect().width);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(set);
    const io = new IntersectionObserver(([e]) => (st.onScreen = e.isIntersecting), { threshold: 0 });
    io.observe(sec);

    const cards = Array.from(tr.querySelectorAll<HTMLElement>("[data-idx]"));

    const tick = (_t: number, dtMs: number) => {
      if (!st.onScreen || st.W === 0) return;
      const dt = Math.min(dtMs, 50) / 1000;

      if (st.dragging) {
        // held: no drift, and any leftover speed dies away so releasing a still hand does not fling
        st.v *= Math.exp(-dt * 14);
      } else {
        // released: carry the momentum, then ease back to the drift speed
        st.v += (DRIFT - st.v) * (1 - Math.exp(-dt * 2.2));
        st.x += st.v * dt;
      }
      // keep x in (-W, 0]: two identical sets make the seam invisible
      st.x = ((st.x % st.W) - st.W) % st.W;
      tr.style.transform = `translate3d(${st.x}px,0,0)`;

      // which card is at the centre of the screen
      if (st.frame++ % 6 === 0) {
        const mid = window.innerWidth / 2;
        let best = 0;
        let bestD = Infinity;
        for (const c of cards) {
          const r = c.getBoundingClientRect();
          const d = Math.abs(r.left + r.width / 2 - mid);
          if (d < bestD) {
            bestD = d;
            best = Number(c.dataset.idx);
          }
        }
        if (best !== st.last && best < projects.length) {
          st.last = best;
          story.tint = projects[best].tint;
          setActive(best);
        }
      }
    };
    gsap.ticker.add(tick);

    // ---- grabbing
    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      st.dragging = true;
      st.moved = 0;
      st.lastX = e.clientX;
      st.lastT = performance.now();
      vp.setPointerCapture(e.pointerId);
      setGrabbing(true);
    };
    const onMove = (e: PointerEvent) => {
      if (!st.dragging) return;
      const now = performance.now();
      const dx = e.clientX - st.lastX;
      const dtm = Math.max(1, now - st.lastT);
      st.x += dx;
      st.moved += Math.abs(dx);
      // smoothed hand velocity, handed over on release
      st.v += ((dx / dtm) * 1000 - st.v) * 0.35;
      st.lastX = e.clientX;
      st.lastT = now;
    };
    const onUp = (e: PointerEvent) => {
      if (!st.dragging) return;
      st.dragging = false;
      st.v = Math.max(-2600, Math.min(2600, st.v));
      if (vp.hasPointerCapture(e.pointerId)) vp.releasePointerCapture(e.pointerId);
      setGrabbing(false);
    };
    // a drag must not count as a click on the card underneath
    const onClickCapture = (e: MouseEvent) => {
      if (st.moved > 6) {
        e.preventDefault();
        e.stopPropagation();
      }
      st.moved = 0;
    };

    vp.addEventListener("pointerdown", onDown);
    vp.addEventListener("pointermove", onMove);
    vp.addEventListener("pointerup", onUp);
    vp.addEventListener("pointercancel", onUp);
    vp.addEventListener("click", onClickCapture, true);

    return () => {
      gsap.ticker.remove(tick);
      ro.disconnect();
      io.disconnect();
      vp.removeEventListener("pointerdown", onDown);
      vp.removeEventListener("pointermove", onMove);
      vp.removeEventListener("pointerup", onUp);
      vp.removeEventListener("pointercancel", onUp);
      vp.removeEventListener("click", onClickCapture, true);
      tr.style.transform = "";
    };
  }, [reducedMotion]);

  const sets = reducedMotion ? [0] : [0, 1];

  return (
    <section
      ref={section}
      id="trabajo"
      data-story="work"
      data-sound="reveal"
      className="relative flex min-h-[100svh] flex-col justify-center py-24 pt-[calc(var(--nav-h)+40px)]"
    >
      <Reveal stagger={0.12} y={26}>
        <div className="mx-auto flex w-full max-w-[1400px] items-end justify-between gap-6 px-5 sm:px-8">
          <div>
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--text-faint)]">
              Trabajo seleccionado
            </span>
            <span className="ml-4 font-mono text-[11px] tabular-nums tracking-[0.14em] text-[var(--text-muted)]">
              <span className="text-[var(--text)]">{String(active + 1).padStart(2, "0")}</span>
              {" / "}
              {String(projects.length).padStart(2, "0")}
            </span>
            <h2 className="display mt-3 text-[clamp(2rem,4.6vw,4rem)] text-[var(--text)]">
              Cosas que existen.
            </h2>
          </div>
        </div>

        <div
          ref={viewport}
          className={`mt-10 select-none ${
            reducedMotion ? "overflow-x-auto" : `overflow-hidden ${grabbing ? "cursor-grabbing" : "cursor-grab"}`
          }`}
          style={{ touchAction: reducedMotion ? undefined : "pan-y" }}
          onDragStart={(e) => e.preventDefault()}
        >
          <div ref={track} className="flex w-max will-change-transform">
            {sets.map((setIdx) => (
              <div
                key={setIdx}
                ref={setIdx === 0 ? firstSet : undefined}
                aria-hidden={setIdx === 1 || undefined}
                className="flex shrink-0 items-center gap-5 px-2.5 sm:gap-7 sm:px-3.5"
              >
                {projects.map((p, i) => (
                  <div key={p.slug} data-idx={i} className="shrink-0">
                    <Tilt>
                      <ProjectCard p={p} hidden={setIdx === 1} />
                    </Tilt>
                  </div>
                ))}

                <Link
                  href="/work"
                  data-idx={projects.length}
                  draggable={false}
                  tabIndex={setIdx === 1 ? -1 : undefined}
                  className="group flex h-[min(62svh,560px)] w-[min(60vw,300px)] shrink-0 flex-col items-start justify-end gap-4 rounded-[var(--radius-md)] border border-dashed p-6"
                  style={{ borderColor: "var(--line-strong)" }}
                >
                  <span className="display text-[clamp(1.8rem,3vw,2.6rem)] text-[var(--text)]">
                    Ver todos los proyectos
                  </span>
                  <span
                    className="flex h-12 w-12 items-center justify-center rounded-full transition-transform duration-300 group-hover:translate-x-1"
                    style={{ background: "var(--accent)", color: "var(--accent-ink)" }}
                  >
                    <ArrowRight size={20} weight="bold" />
                  </span>
                </Link>
              </div>
            ))}
          </div>
        </div>

        {reducedMotion && (
          <p className="mx-auto mt-8 flex max-w-[1400px] flex-wrap items-center gap-x-3 gap-y-2 px-5 text-sm text-[var(--text-muted)] sm:px-8">
            {systemReducedMotion
              ? "Tu sistema pide reducir el movimiento, así que el carrusel está quieto."
              : "Las animaciones están reducidas, así que el carrusel está quieto."}
            <button
              type="button"
              onClick={() => setMotion("full")}
              className="rounded-full border px-3 py-1 text-xs font-medium text-[var(--text)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
              style={{ borderColor: "var(--line-strong)" }}
            >
              Activar animaciones
            </button>
          </p>
        )}

        {!reducedMotion && (
          <p className="mt-8 hidden text-center font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--text-faint)] md:block [@media(hover:none)]:hidden">
            Mantén el clic para sujetar · arrastra para mover
          </p>
        )}
      </Reveal>
    </section>
  );
}
