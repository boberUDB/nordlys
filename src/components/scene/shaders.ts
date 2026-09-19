/**
 * GLSL for the Nordlys world. All shaders share one aurora palette
 * (teal -> sky -> violet -> pink) so the crystal, halo, shards and dust read as one material.
 * Colours arrive as linear uniforms (THREE.Color) and every fragment ends with
 * <colorspace_fragment> so they land on screen as the intended sRGB hex values.
 */

// Ashima Arts / Ian McEwan simplex noise (MIT)
export const NOISE = /* glsl */ `
  vec3 mod289(vec3 x){ return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x){ return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x){ return mod289(((x * 34.0) + 1.0) * x); }
  vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r; }
  float snoise(vec3 v){
    const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
              i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
  }
`;

export const PALETTE = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uColorC;
  uniform vec3 uColorD;
  vec3 aurora(float t){
    t = abs(fract(t) * 2.0 - 1.0); // triangle wave: the palette loops without a seam
    vec3 c = mix(uColorA, uColorB, smoothstep(0.0, 0.36, t));
    c = mix(c, uColorC, smoothstep(0.30, 0.72, t));
    c = mix(c, uColorD, smoothstep(0.66, 1.0, t));
    return c;
  }
`;

/* ------------------------------------------------------------------ crystal */

export const crystalVertex = /* glsl */ `
  uniform float uTime;
  uniform float uDistort;
  uniform float uWater;        // 0..1 how much this scene state behaves like water
  uniform vec3 uPointerDir;    // world direction from the crystal centre toward the cursor
  uniform float uPull;         // 0..1 how strongly the water is drawn toward the cursor
  uniform float uEnergy;       // 0..1 vibration, driven by how fast the cursor moves
  uniform float uClickT;       // seconds since the last click
  uniform vec3 uClickDir;      // where the last click landed
  varying vec3 vWorldPos;
  varying vec3 vNormalW;
  varying vec3 vLocal;
  varying float vNoise;
  ${NOISE}

  vec3 displace(vec3 p){
    float n1 = snoise(p * 1.35 + vec3(0.0, uTime * 0.22, uTime * 0.13));
    float n2 = snoise(p * 2.9 - vec3(uTime * 0.17, 0.0, uTime * 0.11));
    float d = (n1 * 0.75 + n2 * 0.25) * uDistort * 0.42;
    // a fine, always-moving water surface
    d += snoise(p * 3.4 + vec3(uTime * 0.35, -uTime * 0.28, uTime * 0.2)) * 0.014 * uWater;

    vec3 wn = normalize(mat3(modelMatrix) * p);
    float al = dot(wn, uPointerDir);
    float ang = acos(clamp(al, -1.0, 1.0));

    // the water is drawn toward the cursor: a broad swell with a soft crest
    float swell = pow(max(al, 0.0), 2.5) * 0.7 + pow(max(al, 0.0), 10.0) * 0.55;
    d += swell * uPull * 0.36 * uWater;
    // rings that travel away from the pulled spot
    d += sin(ang * 13.0 - uTime * 3.4) * exp(-ang * 2.4) * uPull * 0.016 * uWater;
    // vibrations that follow the cursor: stronger the faster it moves, strongest near it
    d += snoise(p * 6.5 + uTime * 2.1) * uEnergy * smoothstep(-0.2, 1.0, al) * 0.05 * uWater;

    // a click drops one soft ripple that travels around the sphere and fades out
    float ca = acos(clamp(dot(wn, uClickDir), -1.0, 1.0));
    float front = uClickT * 1.25;
    float env = exp(-uClickT * 1.15) * smoothstep(0.0, 0.15, uClickT);
    d += cos((ca - front) * 9.0) * exp(-pow((ca - front) * 2.4, 2.0)) * env * 0.05 * uWater;

    return p * (1.0 + d);
  }

  void main(){
    vec3 nrm = normalize(position);
    vec3 up = abs(nrm.y) > 0.98 ? vec3(1.0, 0.0, 0.0) : vec3(0.0, 1.0, 0.0);
    vec3 t = normalize(cross(nrm, up));
    vec3 b = cross(nrm, t);
    float e = 0.014;
    vec3 p0 = displace(nrm);
    vec3 p1 = displace(normalize(nrm + t * e));
    vec3 p2 = displace(normalize(nrm + b * e));
    vec3 nn = normalize(cross(p1 - p0, p2 - p0));

    vec4 wp = modelMatrix * vec4(p0, 1.0);
    vec3 nW = normalize(mat3(modelMatrix) * nn);

    nW = normalize(nW);

    vWorldPos = wp.xyz;
    vNormalW = nW;
    vLocal = p0;
    vNoise = length(p0) - 1.0;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

export const crystalFragment = /* glsl */ `
  uniform float uTime;
  uniform float uFacet;
  uniform float uWire;
  uniform float uOpacity;
  uniform float uHue;
  uniform float uTintMix;
  uniform vec3 uTint;
  uniform mat3 uRot;
  varying vec3 vWorldPos;
  varying vec3 vNormalW;
  varying vec3 vLocal;
  varying float vNoise;
  ${PALETTE}

  void main(){
    vec3 N = normalize(vNormalW);
    if (!gl_FrontFacing) N = -N;

    // cut-gem facets: snap the local direction to a coarse grid of cells, one flat normal per cell
    vec3 dirL = normalize(vLocal);
    vec3 cell = floor(dirL * 2.3) + 0.5;
    vec3 qN = normalize(uRot * normalize(cell));
    vec3 Nf = normalize(mix(N, qN, uFacet * 0.9));

    vec3 V = normalize(cameraPosition - vWorldPos);
    vec3 L1 = normalize(vec3(-0.55, 0.85, 0.7));
    vec3 L2 = normalize(vec3(0.85, -0.25, 0.45));
    float ndv = max(dot(Nf, V), 0.0);
    float fres = pow(1.0 - ndv, 2.3);
    float diff = max(dot(Nf, L1), 0.0) * 0.62 + max(dot(Nf, L2), 0.0) * 0.28;
    float spec = pow(max(dot(Nf, normalize(L1 + V)), 0.0), 70.0);
    float spec2 = pow(max(dot(Nf, normalize(L2 + V)), 0.0), 40.0) * 0.4;

    float band = dot(Nf, normalize(vec3(0.45, 0.8, 0.3))) * 0.5 + 0.5;
    float t = uHue + band * 0.55 + vNoise * 0.9 + uTime * 0.012;
    vec3 base = aurora(t);
    vec3 rim = mix(aurora(t + 0.28), vec3(1.0), 0.45);

    vec3 col = base * (0.3 + diff * 0.95) + rim * fres * 0.95 + vec3(spec + spec2) * 0.9;
    col += base * pow(ndv, 1.6) * 0.22;

    vec3 tintCol = uTint * (0.32 + diff * 0.95) + mix(uTint, vec3(1.0), 0.5) * fres * 0.9 + vec3(spec + spec2) * 0.8;
    col = mix(col, tintCol, uTintMix * 0.85);

    // holographic wire grid on the surface (x/y/z iso-lines of the displaced position)
    vec3 g = vLocal * 5.5;
    vec3 fw = max(fwidth(g), vec3(1e-4));
    vec3 a = abs(fract(g - 0.5) - 0.5) / fw;
    float line = 1.0 - clamp(min(min(a.x, a.y), a.z), 0.0, 1.0);
    vec3 wireCol = mix(mix(base, uTint, uTintMix * 0.85), vec3(1.0), 0.45) * (line * 1.5 + fres * 0.9 + 0.05);
    col = mix(col, wireCol, uWire);
    float alpha = mix(1.0, clamp(line * 0.95 + fres * 0.75 + 0.05, 0.0, 1.0), uWire);

    col = min(col, vec3(1.15));
    gl_FragColor = vec4(col, alpha * uOpacity);
    #include <colorspace_fragment>
  }
`;

/* -------------------------------------------------------------------- halo */

export const haloVertex = /* glsl */ `
  varying vec2 vUv;
  void main(){
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const haloFragment = /* glsl */ `
  uniform float uStrength;
  uniform float uHue;
  uniform float uTintMix;
  uniform vec3 uTint;
  varying vec2 vUv;
  ${PALETTE}

  void main(){
    float r = length(vUv - 0.5) * 2.0;
    float a = pow(1.0 - smoothstep(0.0, 1.0, r), 2.4) * uStrength;
    vec3 c = mix(aurora(uHue + r * 0.45), uTint, uTintMix * 0.85);
    gl_FragColor = vec4(c * a, a);
    #include <colorspace_fragment>
  }
`;

/* -------------------------------------------------------------------- dust */

export const dustVertex = /* glsl */ `
  uniform float uTime;
  uniform float uFlowTime;
  uniform float uOffset;
  uniform vec2 uPointer;
  uniform float uPixelRatio;
  uniform float uSize;
  uniform float uLight;
  attribute vec4 aRand;
  varying float vAlpha;
  varying vec3 vColor;
  ${PALETTE}

  void main(){
    vec3 p = position;
    float t = uFlowTime;
    p.x += sin(t * 0.15 + aRand.y * 6.2831) * 0.5 + sin(t * 0.07 + aRand.x * 20.0) * 0.3;
    p.z += cos(t * 0.11 + aRand.x * 6.2831) * 0.5;
    float H = 20.0;
    p.y = mod(p.y + t * 0.12 * (0.3 + aRand.z) + uOffset * (0.35 + aRand.x * 0.9) + H * 0.5, H) - H * 0.5;

    // dust is pushed away from the cursor
    vec2 d = p.xy - uPointer;
    float l = length(d);
    float push = smoothstep(2.4, 0.0, l);
    p.xy += (d / (l + 0.001)) * push * 0.95;
    p.z += push * 0.7;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * (0.35 + aRand.w * 0.95) * uPixelRatio * (8.0 / -mv.z);

    float twinkle = 0.65 + 0.35 * sin(uTime * 1.4 + aRand.x * 40.0);
    vAlpha = (0.22 + aRand.z * 0.78) * twinkle * (1.0 - uLight * 0.45);
    vec3 c = aurora(aRand.y * 0.9 + 0.05);
    vColor = mix(c, vec3(0.1, 0.1, 0.2), uLight);
  }
`;

export const dustFragment = /* glsl */ `
  varying float vAlpha;
  varying vec3 vColor;
  void main(){
    float r = length(gl_PointCoord - 0.5) * 2.0;
    float a = (1.0 - smoothstep(0.0, 1.0, r));
    a *= a;
    gl_FragColor = vec4(vColor, a * vAlpha);
    #include <colorspace_fragment>
  }
`;

/* ------------------------------------------------------------------ shards */

export const shardVertex = /* glsl */ `
  varying vec3 vN;
  varying vec3 vWP;
  varying vec3 vCol;
  void main(){
    vec4 wp = modelMatrix * instanceMatrix * vec4(position, 1.0);
    vWP = wp.xyz;
    vN = normalize(mat3(modelMatrix) * mat3(instanceMatrix) * normal);
    #ifdef USE_INSTANCING_COLOR
      vCol = instanceColor;
    #else
      vCol = vec3(1.0);
    #endif
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

export const shardFragment = /* glsl */ `
  uniform float uLight;
  varying vec3 vN;
  varying vec3 vWP;
  varying vec3 vCol;
  void main(){
    vec3 N = normalize(vN);
    vec3 V = normalize(cameraPosition - vWP);
    vec3 L = normalize(vec3(-0.55, 0.85, 0.7));
    float diff = max(dot(N, L), 0.0);
    float fres = pow(1.0 - max(dot(N, V), 0.0), 2.0);
    float spec = pow(max(dot(N, normalize(L + V)), 0.0), 50.0);
    vec3 col = vCol * (0.28 + diff * 0.95) + mix(vCol, vec3(1.0), 0.55) * fres * 0.8 + vec3(spec) * 0.9;
    col = mix(col, col * 0.75, uLight);
    gl_FragColor = vec4(min(col, vec3(1.1)), 1.0);
    #include <colorspace_fragment>
  }
`;
