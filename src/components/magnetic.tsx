"use client";

import { cloneElement, useEffect, useRef } from "react";
import gsap from "gsap";
import { useSettings } from "@/lib/settings-context";

/**
 * Wraps a single interactive child and pulls it a few px toward the
 * pointer while hovered, springing back on leave. This is the "magnetic"
 * effect applied to the element (rather than to the custom cursor), which
 * keeps the cursor's visual position always truthful to the real pointer.
 */
export function Magnetic({
  children,
  strength = 0.35,
}: {
  children: React.ReactElement;
  strength?: number;
}) {
  const { reducedMotion } = useSettings();
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const x = gsap.quickTo(el, "x", { duration: 0.35, ease: "power3" });
    const y = gsap.quickTo(el, "y", { duration: 0.35, ease: "power3" });

    function onMove(e: PointerEvent) {
      const rect = el!.getBoundingClientRect();
      const relX = e.clientX - (rect.left + rect.width / 2);
      const relY = e.clientY - (rect.top + rect.height / 2);
      x(relX * strength);
      y(relY * strength);
    }
    function onLeave() {
      x(0);
      y(0);
    }

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [reducedMotion, strength]);

  return cloneElement(children, { ref } as React.RefAttributes<HTMLElement>);
}
