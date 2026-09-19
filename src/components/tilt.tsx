"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useSettings } from "@/lib/settings-context";

/** Perspective tilt toward the pointer. Immediate (no lag) and only on real hover devices. */
export function Tilt({
  children,
  className,
  max = 7,
}: {
  children: React.ReactNode;
  className?: string;
  max?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { reducedMotion } = useSettings();

  useEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const rx = gsap.quickTo(el, "rotationX", { duration: 0.25, ease: "power3" });
    const ry = gsap.quickTo(el, "rotationY", { duration: 0.25, ease: "power3" });

    function onMove(e: PointerEvent) {
      const r = el!.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      ry(px * max * 2);
      rx(-py * max * 2);
    }
    function onLeave() {
      rx(0);
      ry(0);
    }
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      gsap.set(el, { clearProps: "transform" });
    };
  }, [reducedMotion, max]);

  return (
    <div className={className} style={{ perspective: 900 }}>
      <div ref={ref} className="h-full w-full" style={{ transformStyle: "preserve-3d" }}>
        {children}
      </div>
    </div>
  );
}
