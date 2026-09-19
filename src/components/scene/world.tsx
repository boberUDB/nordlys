"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import * as THREE from "three";
import type { Quality, Theme } from "@/lib/settings-context";
import { KEYFRAMES, markSceneReady, story, type Keyframe } from "@/lib/story";
import {
  crystalFragment,
  crystalVertex,
  dustFragment,
  dustVertex,
  haloFragment,
  haloVertex,
  shardFragment,
  shardVertex,
} from "./shaders";

/* ------------------------------------------------------------------ config */

const CRYSTAL_DETAIL: Record<Quality, number> = { high: 28, medium: 16, low: 8 };
const DUST_COUNT: Record<Quality, number> = { high: 5200, medium: 2800, low: 1200 };
const SHARD_COUNT: Record<Quality, number> = { high: 40, medium: 26, low: 14 };

const AURORA = ["#5eead4", "#7dd3fc", "#a78bfa", "#f0abfc"] as const;

const NUMERIC_KEYS = [
  "rot", "distort", "facet", "wire", "ring", "spread", "flow", "halo", "op", "hue", "tint", "water",
] as const satisfies readonly (keyof Keyframe)[];

/**
 * The single source of truth the meshes read from each frame. The StoryDriver blends
 * the keyframes with the scroll and writes here; nothing else touches the DOM.
 */
const live = {
  rot: 1, distort: 0.5, facet: 0, wire: 0, ring: 0, spread: 1, flow: 1, halo: 1, op: 1, hue: 0, tint: 0, water: 1,
  cx: 0, cy: 0, R: 1,
  px: 0, py: 0, // pointer in world units
  attract: 0,
  scrollOffset: 0,
  flowTime: 0,
  tintColor: new THREE.Color(story.tint),
  tintTarget: new THREE.Color(story.tint),
};

function paletteUniforms() {
  return {
    uColorA: { value: new THREE.Color(AURORA[0]) },
    uColorB: { value: new THREE.Color(AURORA[1]) },
    uColorC: { value: new THREE.Color(AURORA[2]) },
    uColorD: { value: new THREE.Color(AURORA[3]) },
  };
}

const smooth = (k: number) => k * k * (3 - 2 * k);
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/* ------------------------------------------------------------------ driver */

/** Reads every [data-story] section's position and blends the keyframes by scroll. */
function StoryDriver({ reducedMotion }: { reducedMotion: boolean }) {
  const els = useRef<HTMLElement[]>([]);
  const frame = useRef(0);
  const blended = useRef<Keyframe>({ ...KEYFRAMES.hero });

  useFrame((state, delta) => {
    if (frame.current++ % 20 === 0) {
      els.current = Array.from(document.querySelectorAll<HTMLElement>("[data-story]"));
    }
    const list = els.current;
    const vh = window.innerHeight;
    const out = blended.current;

    let a: Keyframe;
    let b: Keyframe;
    let f = 0;
    if (list.length === 0) {
      a = b = KEYFRAMES.ambient;
    } else {
      // every boundary between two sections that has crossed the middle band moves us one keyframe on
      const band = vh * 0.8;
      let s = 0;
      for (let i = 1; i < list.length; i++) {
        const top = list[i].getBoundingClientRect().top;
        s += smooth(clamp01((vh / 2 + band / 2 - top) / band));
      }
      s = Math.min(s, list.length - 1);
      const i0 = Math.floor(s);
      const i1 = Math.min(i0 + 1, list.length - 1);
      f = s - i0;
      a = KEYFRAMES[list[i0].dataset.story ?? "ambient"] ?? KEYFRAMES.ambient;
      b = KEYFRAMES[list[i1].dataset.story ?? "ambient"] ?? KEYFRAMES.ambient;
    }

    const lerp = (k: Exclude<keyof Keyframe, "px">) => a[k] + (b[k] - a[k]) * f;
    const { width: vw, height: vhw } = state.viewport;
    const portrait = state.size.width / state.size.height < 0.9;

    const tx = portrait ? (a.px ?? 0) + ((b.px ?? 0) - (a.px ?? 0)) * f : lerp("x");
    const ty = portrait ? lerp("py") : lerp("y");
    const ts = portrait ? lerp("ps") : lerp("s");
    const ref = Math.min(vhw, vw * (portrait ? 1.15 : 1.4));

    const lambda = reducedMotion ? 9 : 4.6;
    for (const k of NUMERIC_KEYS) {
      out[k] = lerp(k);
      live[k] = THREE.MathUtils.damp(live[k], out[k], lambda, delta);
    }
    live.cx = THREE.MathUtils.damp(live.cx, tx * (vw / 2), lambda, delta);
    live.cy = THREE.MathUtils.damp(live.cy, ty * (vhw / 2), lambda, delta);
    live.R = THREE.MathUtils.damp(live.R, ts * (ref / 2), lambda, delta);

    // pointer, smoothed, in world units on the z=0 plane
    live.px = THREE.MathUtils.damp(live.px, story.pointer.x * (vw / 2), 10, delta);
    live.py = THREE.MathUtils.damp(live.py, story.pointer.y * (vhw / 2), 10, delta);

    live.attract = THREE.MathUtils.damp(live.attract, story.attract, 4, delta);

    live.tintTarget.set(story.tint);
    live.tintColor.lerp(live.tintTarget, 1 - Math.exp(-4 * delta));

    // dust: continuous flow + a scroll-linked offset so it streams past faster than the crystal moves
    live.flowTime += delta * live.flow * (reducedMotion ? 0.25 : 1);
    live.scrollOffset = (window.scrollY / vh) * 5;

    // camera drifts a little with the pointer (skipped under reduced motion)
    if (!reducedMotion) {
      const cam = state.camera;
      cam.position.x = THREE.MathUtils.damp(cam.position.x, story.pointer.x * 0.35, 3, delta);
      cam.position.y = THREE.MathUtils.damp(cam.position.y, story.pointer.y * 0.22, 3, delta);
      cam.lookAt(0, 0, 0);
    }
  });

  return null;
}

/* ----------------------------------------------------------------- crystal */

/** A damped spring: under-damped on purpose, so the water overshoots and wobbles before it settles. */
type Spring = { x: number; v: number };
function stepSpring(s: Spring, target: number, k: number, c: number, dt: number) {
  const h = Math.min(dt, 1 / 30);
  s.v += (k * (target - s.x) - c * s.v) * h;
  s.x += s.v * h;
}

function Crystal({ quality, reducedMotion }: { quality: Quality; reducedMotion: boolean }) {
  const mesh = useRef<THREE.Mesh>(null);
  const geometry = useMemo(() => new THREE.IcosahedronGeometry(1, CRYSTAL_DETAIL[quality]), [quality]);
  useEffect(() => () => geometry.dispose(), [geometry]);

  const uniforms = useMemo(
    () => ({
      ...paletteUniforms(),
      uTime: { value: 0 },
      uDistort: { value: 0.5 },
      uWater: { value: 1 },
      uPointerDir: { value: new THREE.Vector3(0, 0, 1) },
      uPull: { value: 0 },
      uEnergy: { value: 0 },
      uClickT: { value: 99 },
      uClickDir: { value: new THREE.Vector3(0, 0, 1) },
      uFacet: { value: 0 },
      uWire: { value: 0 },
      uOpacity: { value: 1 },
      uHue: { value: 0 },
      uTintMix: { value: 0 },
      uTint: { value: new THREE.Color() },
      uRot: { value: new THREE.Matrix3() },
    }),
    []
  );
  const mat = useRef<THREE.ShaderMaterial>(null);
  const tmp = useMemo(() => new THREE.Matrix4(), []);

  // the water's memory: where it is being pulled, how hard, and how agitated it is
  const water = useRef({
    dx: { x: 0, v: 0 } as Spring,
    dy: { x: 0, v: 0 } as Spring,
    dz: { x: 1, v: 0 } as Spring,
    pull: { x: 0, v: 0 } as Spring,
    energy: 0,
    lastX: 0,
    lastY: 0,
    clickT: 99,
    clickDir: new THREE.Vector3(0, 0, 1),
    dir: new THREE.Vector3(0, 0, 1),
  });

  useFrame((state, delta) => {
    const m = mesh.current;
    const material = mat.current;
    if (!m || !material) return;
    // read the uniforms back from the material itself: R3F may not keep our object by reference
    const u = material.uniforms as typeof uniforms;
    const spin = reducedMotion ? 0.12 : 1;

    u.uTime.value += delta * (reducedMotion ? 0.3 : 1);
    m.rotation.y += delta * 0.18 * live.rot * spin;
    m.rotation.x += delta * 0.06 * live.rot * spin;
    m.rotation.z = THREE.MathUtils.damp(m.rotation.z, reducedMotion ? 0 : story.pointer.x * 0.12, 3, delta);
    m.position.set(live.cx, live.cy, 0);
    m.scale.setScalar(Math.max(live.R, 0.0001));

    u.uDistort.value = live.distort * (reducedMotion ? 0.5 : 1);

    // ---- water: the surface is drawn toward the cursor and vibrates as the cursor moves
    const w = water.current;
    const engaged = story.pointer.active && !reducedMotion;
    // the cursor as a point floating just in front of the crystal, seen from its centre
    const tx = live.px - live.cx;
    const ty = live.py - live.cy;
    const tz = live.R * 0.85;
    const len = Math.hypot(tx, ty, tz) || 1;
    const away = Math.hypot(tx, ty) / Math.max(live.R, 0.0001); // cursor distance in crystal radii
    const pullTarget = engaged ? THREE.MathUtils.smoothstep(4.6 - away, 0, 4.0) : 0;

    stepSpring(w.dx, engaged ? tx / len : 0, 46, 5.2, delta);
    stepSpring(w.dy, engaged ? ty / len : 0, 46, 5.2, delta);
    stepSpring(w.dz, engaged ? tz / len : 1, 46, 5.2, delta);
    stepSpring(w.pull, pullTarget, 34, 4.6, delta);
    w.dir.set(w.dx.x, w.dy.x, w.dz.x).normalize();

    // vibration energy: quick to rise with cursor speed, slow to die away
    const speed = Math.hypot(live.px - w.lastX, live.py - w.lastY) / Math.max(delta, 0.001);
    w.lastX = live.px;
    w.lastY = live.py;
    const energyTarget = engaged ? Math.min(1, speed / 7) : 0;
    w.energy =
      energyTarget > w.energy
        ? w.energy + (energyTarget - w.energy) * (1 - Math.exp(-delta * 10))
        : w.energy * Math.exp(-delta * 1.4);

    // a click drops a single, soft ripple where the cursor is
    if (story.click) {
      story.click = false;
      w.clickT = 0;
      w.clickDir.copy(w.dir);
    } else {
      w.clickT = Math.min(99, w.clickT + delta);
    }

    u.uWater.value = live.water * (reducedMotion ? 0.15 : 1);
    u.uPointerDir.value.copy(w.dir);
    u.uPull.value = Math.max(0, w.pull.x);
    u.uEnergy.value = w.energy;
    u.uClickT.value = w.clickT;
    u.uClickDir.value.copy(w.clickDir);
    u.uFacet.value = live.facet;
    u.uWire.value = live.wire;
    u.uOpacity.value = live.op;
    u.uHue.value = live.hue;
    u.uTintMix.value = live.tint;
    u.uTint.value.copy(live.tintColor);
    u.uRot.value.setFromMatrix4(tmp.makeRotationFromEuler(m.rotation));

    // a wire-frame crystal is see-through: draw both faces and let the dust behind show
    material.depthWrite = live.wire < 0.5;
    material.side = live.wire > 0.02 ? THREE.DoubleSide : THREE.FrontSide;
    m.visible = live.op > 0.005;
  });

  return (
    <mesh ref={mesh} geometry={geometry} frustumCulled={false} renderOrder={-1}>
      <shaderMaterial
        ref={mat}
        uniforms={uniforms}
        vertexShader={crystalVertex}
        fragmentShader={crystalFragment}
        transparent
        depthWrite
      />
    </mesh>
  );
}

/* -------------------------------------------------------------------- halo */

function Halo({ theme }: { theme: Theme }) {
  const mesh = useRef<THREE.Mesh>(null);
  const uniforms = useMemo(
    () => ({
      ...paletteUniforms(),
      uStrength: { value: 0.5 },
      uHue: { value: 0 },
      uTintMix: { value: 0 },
      uTint: { value: new THREE.Color() },
    }),
    []
  );
  const mat = useRef<THREE.ShaderMaterial>(null);

  useEffect(() => {
    if (!mat.current) return;
    mat.current.blending = theme === "light" ? THREE.NormalBlending : THREE.AdditiveBlending;
    mat.current.needsUpdate = true;
  }, [theme]);

  useFrame(() => {
    const m = mesh.current;
    const u = mat.current?.uniforms as typeof uniforms | undefined;
    if (!m || !u) return;
    m.position.set(live.cx, live.cy, -1.2);
    m.scale.setScalar(Math.max(live.R * 4.2, 0.0001));
    u.uStrength.value = live.halo * 0.42 * Math.min(1, live.op + 0.25) * (theme === "light" ? 0.55 : 1);
    u.uHue.value = live.hue;
    u.uTintMix.value = live.tint;
    u.uTint.value.copy(live.tintColor);
  });

  return (
    <mesh ref={mesh} frustumCulled={false} renderOrder={-3}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={mat}
        uniforms={uniforms}
        vertexShader={haloVertex}
        fragmentShader={haloFragment}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

/* -------------------------------------------------------------------- dust */

function Dust({
  quality,
  theme,
  reducedMotion,
}: {
  quality: Quality;
  theme: Theme;
  reducedMotion: boolean;
}) {
  const points = useRef<THREE.Points>(null);
  const mat = useRef<THREE.ShaderMaterial>(null);
  const count = DUST_COUNT[quality];

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const rnd = new Float32Array(count * 4);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 32;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = Math.random() * 14 - 10;
      rnd[i * 4] = Math.random();
      rnd[i * 4 + 1] = Math.random();
      rnd[i * 4 + 2] = Math.random();
      rnd[i * 4 + 3] = Math.random();
    }
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aRand", new THREE.BufferAttribute(rnd, 4));
    return g;
  }, [count]);
  useEffect(() => () => geometry.dispose(), [geometry]);

  const uniforms = useMemo(
    () => ({
      ...paletteUniforms(),
      uTime: { value: 0 },
      uFlowTime: { value: 0 },
      uOffset: { value: 0 },
      uPointer: { value: new THREE.Vector2() },
      uPixelRatio: { value: 1 },
      uSize: { value: 2.6 },
      uLight: { value: 0 },
    }),
    []
  );

  useEffect(() => {
    if (!mat.current) return;
    mat.current.blending = theme === "light" ? THREE.NormalBlending : THREE.AdditiveBlending;
    mat.current.needsUpdate = true;
  }, [theme]);

  useFrame((state, delta) => {
    const u = mat.current?.uniforms as typeof uniforms | undefined;
    if (!u) return;
    u.uTime.value += delta * (reducedMotion ? 0.3 : 1);
    u.uFlowTime.value = live.flowTime;
    u.uOffset.value = live.scrollOffset;
    u.uPointer.value.set(reducedMotion ? 99 : live.px, reducedMotion ? 99 : live.py);
    u.uPixelRatio.value = state.gl.getPixelRatio();
    u.uLight.value = THREE.MathUtils.damp(u.uLight.value, theme === "light" ? 1 : 0, 5, delta);
  });

  return (
    <points ref={points} geometry={geometry} frustumCulled={false} renderOrder={0}>
      <shaderMaterial
        ref={mat}
        uniforms={uniforms}
        vertexShader={dustVertex}
        fragmentShader={dustFragment}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/* ------------------------------------------------------------------ shards */

type Shard = {
  radius: number;
  speed: number;
  phase: number;
  incl: number;
  size: number;
  spinX: number;
  spinY: number;
  lift: number;
};

function Shards({
  quality,
  theme,
  reducedMotion,
}: {
  quality: Quality;
  theme: Theme;
  reducedMotion: boolean;
}) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const count = SHARD_COUNT[quality];
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const uniforms = useMemo(() => ({ uLight: { value: 0 } }), []);
  const shardMat = useRef<THREE.ShaderMaterial>(null);

  const shards = useMemo<Shard[]>(
    () =>
      Array.from({ length: count }, () => ({
        radius: 1.25 + Math.random() * 1.0,
        speed: (0.04 + Math.random() * 0.2) * (Math.random() < 0.5 ? -1 : 1),
        phase: Math.random() * Math.PI * 2,
        incl: (Math.random() - 0.5) * 1.6,
        size: 0.03 + Math.pow(Math.random(), 2.4) * 0.09,
        spinX: (Math.random() - 0.5) * 1.6,
        spinY: (Math.random() - 0.5) * 1.6,
        lift: (Math.random() - 0.5) * 0.9,
      })),
    [count]
  );

  // layout effect: instanceColor must exist before the first render so the shader compiles with it
  useLayoutEffect(() => {
    const m = mesh.current;
    if (!m) return;
    const c = new THREE.Color();
    shards.forEach((_, i) => {
      c.set(AURORA[Math.floor(Math.random() * AURORA.length)]);
      m.setColorAt(i, c);
    });
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [shards]);

  const time = useRef(0);

  useFrame((_, delta) => {
    const m = mesh.current;
    if (!m) return;
    time.current += delta * (reducedMotion ? 0.2 : 1);
    const t = time.current;
    const pull = 1 - 0.5 * live.attract;

    m.position.set(live.cx, live.cy, 0);
    if (shardMat.current) shardMat.current.uniforms.uLight.value = theme === "light" ? 1 : 0;

    for (let i = 0; i < shards.length; i++) {
      const s = shards[i];
      const ang = s.phase + t * s.speed * (1 + live.flow * 0.35);
      const r = live.R * s.radius * live.spread * pull;
      const ci = Math.cos(s.incl);
      const si = Math.sin(s.incl);
      // an inclined circular orbit, flattened in z so shards never swing up into the headline
      const ox = Math.cos(ang) * r;
      const oy = Math.sin(ang) * r * ci * 0.75 + s.lift * live.R;
      const oz = Math.sin(ang) * r * si * 0.35;
      dummy.position.set(ox, oy, oz);
      dummy.rotation.set(t * s.spinX, t * s.spinY, 0);
      dummy.scale.setScalar(Math.max(live.R * s.size, 0.0001));
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      key={count}
      ref={mesh}
      args={[undefined, undefined, count]}
      frustumCulled={false}
      renderOrder={1}
    >
      <octahedronGeometry args={[1, 0]} />
      <shaderMaterial ref={shardMat} uniforms={uniforms} vertexShader={shardVertex} fragmentShader={shardFragment} />
    </instancedMesh>
  );
}

/* ------------------------------------------------------------------- rings */

function Rings({ theme }: { theme: Theme }) {
  const group = useRef<THREE.Group>(null);
  const r1 = useRef<THREE.Mesh>(null);
  const r2 = useRef<THREE.Mesh>(null);
  const m1 = useRef<THREE.MeshBasicMaterial>(null);
  const m2 = useRef<THREE.MeshBasicMaterial>(null);

  useFrame((_, delta) => {
    const g = group.current;
    if (!g || !r1.current || !r2.current || !m1.current || !m2.current) return;
    g.position.set(live.cx, live.cy, 0);
    const o1 = clamp01(live.ring) * 0.7 * live.op;
    const o2 = clamp01(live.ring - 1) * 0.55 * live.op;
    m1.current.opacity = o1;
    m2.current.opacity = o2;
    r1.current.visible = o1 > 0.01;
    r2.current.visible = o2 > 0.01;
    r1.current.scale.setScalar(live.R * 1.6);
    r2.current.scale.setScalar(live.R * 2.0);
    r1.current.rotation.z += delta * 0.25 * live.rot;
    r2.current.rotation.z -= delta * 0.18 * live.rot;
  });

  const color = theme === "light" ? "#4a3fb0" : "#a5f3fc";
  return (
    <group ref={group} renderOrder={2}>
      <mesh ref={r1} rotation={[1.25, 0.25, 0]} frustumCulled={false}>
        <torusGeometry args={[1, 0.004, 8, 240]} />
        <meshBasicMaterial
          ref={m1}
          color={color}
          transparent
          depthWrite={false}
          blending={theme === "light" ? THREE.NormalBlending : THREE.AdditiveBlending}
        />
      </mesh>
      <mesh ref={r2} rotation={[0.35, 1.15, 0.5]} frustumCulled={false}>
        <torusGeometry args={[1, 0.004, 8, 240]} />
        <meshBasicMaterial
          ref={m2}
          color={color}
          transparent
          depthWrite={false}
          blending={theme === "light" ? THREE.NormalBlending : THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

/* --------------------------------------------------------- input + ready */

function InputBridge() {
  useEffect(() => {
    function onMove(e: PointerEvent) {
      story.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      story.pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
      story.pointer.active = true;
    }
    function onLeave() {
      story.pointer.active = false;
    }
    function onDown(e: PointerEvent) {
      const t = e.target as HTMLElement | null;
      if (t?.closest?.("a, button, input, textarea, select, label, [role='menu']")) return;
      story.click = true;
    }
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, []);
  return null;
}

function ReadySignal() {
  const frames = useRef(0);
  useFrame(() => {
    if (frames.current < 4 && ++frames.current === 4) markSceneReady();
  });
  return null;
}

/* ------------------------------------------------------------------- world */

export default function World({
  quality,
  reducedMotion,
  theme,
  compact,
}: {
  quality: Quality;
  reducedMotion: boolean;
  theme: Theme;
  compact: boolean;
}) {
  const [dpr, setDpr] = useState<[number, number]>(compact ? [1, 1.5] : [1, quality === "high" ? 2 : 1.5]);
  // phones get lighter geometry/dust than the chosen quality would imply
  const q: Quality = compact && quality === "high" ? "medium" : quality;

  return (
    <Canvas
      dpr={dpr}
      camera={{ position: [0, 0, 8], fov: 35, near: 0.1, far: 60 }}
      gl={{ antialias: q === "high", alpha: true, powerPreference: "high-performance" }}
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
    >
      {/* if the GPU struggles, step the resolution down instead of dropping frames */}
      <PerformanceMonitor
        onDecline={() => setDpr([1, 1])}
        onIncline={() => setDpr(compact ? [1, 1.5] : [1, 2])}
      />
      <StoryDriver reducedMotion={reducedMotion} />
      <InputBridge />
      <Halo theme={theme} />
      <Crystal quality={q} reducedMotion={reducedMotion} />
      <Dust quality={q} theme={theme} reducedMotion={reducedMotion} />
      <Shards quality={q} theme={theme} reducedMotion={reducedMotion} />
      <Rings theme={theme} />
      <ReadySignal />
    </Canvas>
  );
}
