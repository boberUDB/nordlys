"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useSettings } from "@/lib/settings-context";
import { markSceneReady } from "@/lib/story";

const World = dynamic(() => import("./world"), { ssr: false });

function hasWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

/** CSS-only stand-in for "low" quality or devices without WebGL: same footprint, zero GPU. */
function StaticGlow() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        className="absolute -right-[10%] top-[8%] aspect-square w-[min(80vw,620px)] rounded-full opacity-30 blur-[80px]"
        style={{ background: "var(--aurora)" }}
      />
      <div
        className="absolute -left-[15%] top-[62%] aspect-square w-[min(70vw,520px)] rounded-full opacity-[0.16] blur-[90px]"
        style={{ background: "var(--aurora)" }}
      />
    </div>
  );
}

/**
 * One persistent, fixed WebGL world behind every page. It lives outside the routed content
 * so navigating between pages morphs the same crystal instead of remounting a canvas.
 */
export function SceneRoot() {
  const { quality, reducedMotion, theme } = useSettings();
  const [mode, setMode] = useState<"pending" | "3d" | "static">("pending");
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    setCompact(window.matchMedia("(max-width: 767px)").matches);
    setMode(quality !== "low" && hasWebGL() ? "3d" : "static");
  }, [quality]);

  useEffect(() => {
    if (mode === "static") markSceneReady();
  }, [mode]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
      {mode === "3d" && (
        <World quality={quality} reducedMotion={reducedMotion} theme={theme} compact={compact} />
      )}
      {mode === "static" && <StaticGlow />}
    </div>
  );
}
