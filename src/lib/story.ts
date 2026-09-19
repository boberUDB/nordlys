/**
 * Shared, mutable "story" state between the DOM and the 3D world.
 *
 * The page is a sequence of sections tagged with `data-story="<key>"`. The 3D
 * scene reads where those sections sit on screen every frame and blends between
 * the matching keyframes below, so the crystal, particles and shards are choreographed
 * by scroll. It is a plain object (not React state) on purpose: it is read at 60fps
 * inside the render loop and written from event handlers, so re-renders would only
 * add lag.
 */

export type Keyframe = {
  /** crystal centre, as a fraction of half the viewport width/height (-1..1) */
  x: number;
  y: number;
  /** crystal radius as a fraction of half the reference viewport size */
  s: number;
  /** same as x/y/s, used on portrait (phone) viewports where text takes the full width */
  py: number;
  ps: number;
  /** portrait x (defaults to 0, centred) */
  px?: number;
  /** rotation speed multiplier */
  rot: number;
  /** liquid displacement amount (0 smooth sphere .. 1 very fluid) */
  distort: number;
  /** 0 smooth shading .. 1 cut-gem facets */
  facet: number;
  /** 0 solid .. 1 holographic wire grid */
  wire: number;
  /** orbit rings visible (0..2) */
  ring: number;
  /** shard orbit radius multiplier */
  spread: number;
  /** particle flow speed multiplier */
  flow: number;
  /** glow halo strength */
  halo: number;
  /** overall crystal opacity */
  op: number;
  /** shifts the aurora palette (0..1) */
  hue: number;
  /** 0..1: how much the crystal is tinted by the active project colour */
  tint: number;
  /** 0..1: how much the surface behaves like water (drawn to the cursor, ripples, vibration) */
  water: number;
};

export const KEYFRAMES: Record<string, Keyframe> = {
  hero: {
    x: 0.55, y: 0.08, s: 0.5, py: 0.42, ps: 0.5,
    rot: 1, distort: 0.1, facet: 0, wire: 0, ring: 0, spread: 1, flow: 1, halo: 1, op: 1, hue: 0, tint: 0, water: 1,
  },
  identity: {
    x: -0.52, y: 0, s: 0.58, py: 0.64, ps: 0.36,
    rot: 0.8, distort: 1, facet: 0, wire: 0, ring: 0, spread: 0.8, flow: 0.8, halo: 1, op: 1, hue: 0.05, tint: 0, water: 0.8,
  },
  product: {
    x: 0.52, y: 0, s: 0.55, py: 0.64, ps: 0.36,
    rot: 1.5, distort: 0.1, facet: 1, wire: 0, ring: 1, spread: 1.0, flow: 1, halo: 0.9, op: 1, hue: 0.38, tint: 0, water: 0.3,
  },
  web3d: {
    x: -0.5, y: 0, s: 0.58, py: 0.64, ps: 0.36,
    rot: 1.1, distort: 0.28, facet: 0, wire: 1, ring: 2, spread: 1.15, flow: 1.7, halo: 1, op: 1, hue: 0.72, tint: 0, water: 0.6,
  },
  work: {
    x: 0.84, y: 0.66, s: 0.13, px: 0.78, py: 0.7, ps: 0.1,
    rot: 2.2, distort: 0.25, facet: 0.6, wire: 0, ring: 0, spread: 0.55, flow: 0.6, halo: 0.7, op: 0.95, hue: 0.2, tint: 1, water: 0.4,
  },
  manifesto: {
    x: 0, y: 0, s: 1.02, py: 0.1, ps: 0.9,
    rot: 0.4, distort: 0.85, facet: 0, wire: 0, ring: 0, spread: 2.3, flow: 0.5, halo: 0.6, op: 0.3, hue: 0.55, tint: 0, water: 0.3,
  },
  cta: {
    x: 0, y: 0.42, s: 0.34, py: 0.5, ps: 0.4,
    rot: 2.4, distort: 0.7, facet: 0.15, wire: 0, ring: 1, spread: 0.7, flow: 2.2, halo: 1.3, op: 1, hue: 0.15, tint: 0, water: 1,
  },
  // calm background state for every page that is not the home story
  ambient: {
    x: 0.72, y: 0.5, s: 0.26, py: 0.8, ps: 0.2,
    rot: 0.6, distort: 0.5, facet: 0, wire: 0, ring: 0, spread: 0.9, flow: 0.7, halo: 0.8, op: 0.75, hue: 0.1, tint: 0, water: 0.5,
  },
};

export const story = {
  /** hex colour of the project currently in focus (gallery / work list) */
  tint: "#5eead4",
  /** set to true on click: the crystal drops one soft ripple at the cursor */
  click: false,
  /** 0..1 target: set while a call-to-action is hovered, shards are pulled in */
  attract: 0,
  /** pointer, normalised -1..1 (y up) */
  pointer: { x: 0, y: 0, active: false },
};

/** Raised once the WebGL canvas (or its static fallback) has been shown. */
export const SCENE_READY_EVENT = "nordlys:scene-ready";

export function markSceneReady() {
  if (typeof window === "undefined") return;
  (window as unknown as { __nordlysSceneReady?: boolean }).__nordlysSceneReady = true;
  window.dispatchEvent(new Event(SCENE_READY_EVENT));
}

export function isSceneReady() {
  if (typeof window === "undefined") return false;
  return !!(window as unknown as { __nordlysSceneReady?: boolean }).__nordlysSceneReady;
}

// per-page variants of the calm background state
KEYFRAMES.worklist = {
  ...KEYFRAMES.ambient,
  x: 0.8, y: 0.45, s: 0.24, py: 0.86, ps: 0.16, facet: 0.4, tint: 1,
};
KEYFRAMES.contact = {
  ...KEYFRAMES.ambient,
  x: -0.86, y: -0.62, s: 0.2, py: 0.86, ps: 0.16, hue: 0.3,
};
