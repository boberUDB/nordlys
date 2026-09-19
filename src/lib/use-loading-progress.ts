"use client";

import { useEffect, useRef, useState } from "react";
import { SCENE_READY_EVENT, isSceneReady } from "@/lib/story";

/**
 * Real loading progress, not a fake timer. Combines actual browser
 * lifecycle signals (DOM ready, fonts, window load) and the moment the 3D world has
 * drawn its first frames into checkpoints, then eases the *displayed* number toward
 * that real target each frame so it reads smoothly instead of jumping in big steps.
 * The eased number never overtakes the real target.
 */
export function useLoadingProgress() {
  const [display, setDisplay] = useState(0);
  const [done, setDone] = useState(false);
  const targetRef = useRef(4); // small immediate bump so it never sits at a dead 0%

  useEffect(() => {
    let cancelled = false;
    const state = { loaded: false, scene: false };

    function bump(to: number) {
      if (cancelled) return;
      targetRef.current = Math.max(targetRef.current, to);
    }
    function settle() {
      // 100% only once the page is loaded AND the 3D world has rendered
      if (state.loaded && state.scene) bump(100);
    }

    if (document.readyState !== "loading") bump(30);
    else document.addEventListener("DOMContentLoaded", () => bump(30), { once: true });

    document.fonts.ready.then(() => bump(60)).catch(() => bump(60));

    const onLoad = () => {
      state.loaded = true;
      bump(85);
      settle();
    };
    if (document.readyState === "complete") onLoad();
    else window.addEventListener("load", onLoad, { once: true });

    const onScene = () => {
      state.scene = true;
      bump(92);
      settle();
    };
    if (isSceneReady()) onScene();
    else window.addEventListener(SCENE_READY_EVENT, onScene, { once: true });

    // safety net: never let a slow resource or a missing GPU hold the screen forever
    const timeout = window.setTimeout(() => bump(100), 6000);

    let raf: number;
    function tick() {
      setDisplay((d) => {
        const target = targetRef.current;
        if (d >= target) return target === 100 ? 100 : d;
        const next = d + Math.max(0.6, (target - d) * 0.12);
        return next >= target ? target : next;
      });
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      window.clearTimeout(timeout);
      window.removeEventListener(SCENE_READY_EVENT, onScene);
    };
  }, []);

  useEffect(() => {
    if (display >= 100) {
      const t = window.setTimeout(() => setDone(true), 250);
      return () => window.clearTimeout(t);
    }
  }, [display]);

  return { progress: Math.round(display), done };
}
