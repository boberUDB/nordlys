/**
 * Abstract, generated cover art for each project: one SVG composition per slug, drawn with
 * currentColor so the card's tint drives it. Every piece is alive (rings pulse, leaves sway,
 * the chart draws itself...) through the .art-* keyframes in globals.css. With reduced motion
 * they stop on their resting frame.
 */
export function ProjectArt({ slug, className }: { slug: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 400 300"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      className={className}
      aria-hidden
    >
      {art(slug)}
    </svg>
  );
}

const RINGS = [92, 70, 50, 32, 16];
const delay = (s: number) => ({ animationDelay: `${s}s` });

function art(slug: string) {
  switch (slug) {
    case "faraday": // headphones: concentric drivers that pulse outward + headband
      return (
        <>
          <path d="M70 200 C70 60 330 60 330 200" strokeWidth="10" strokeLinecap="round" opacity="0.75" className="art-float" />
          {[90, 310].map((cx, side) => (
            <g key={cx}>
              {RINGS.map((r, i) => (
                <circle
                  key={r}
                  cx={cx}
                  cy="205"
                  r={r}
                  className="art-pulse"
                  style={delay((RINGS.length - i) * 0.22 + side * 0.4)}
                />
              ))}
            </g>
          ))}
        </>
      );
    case "anthem": // a trail of particles along a running curve, twinkling in sequence
      return (
        <>
          {Array.from({ length: 70 }, (_, i) => {
            const t = i / 69;
            const x = 20 + t * 360;
            const y = 230 - Math.sin(t * Math.PI * 1.15) * 150 + Math.sin(i * 12.9) * 14 * (1 - t * 0.4);
            return (
              <circle
                key={i}
                cx={x.toFixed(1)}
                cy={y.toFixed(1)}
                r={(1 + t * 4.5).toFixed(2)}
                fill="currentColor"
                stroke="none"
                opacity={(0.3 + t * 0.7).toFixed(2)}
                className="art-twinkle"
                style={delay(t * 3.2)}
              />
            );
          })}
        </>
      );
    case "quill": // oversized glyph, floating
      return (
        <g className="art-float">
          <text
            x="200"
            y="245"
            textAnchor="middle"
            fontSize="310"
            fontWeight="700"
            fill="currentColor"
            fillOpacity="0.14"
            stroke="currentColor"
            strokeWidth="1.5"
            style={{ fontFamily: "var(--font-geist-sans), sans-serif" }}
          >
            Q
          </text>
        </g>
      );
    case "verdant": // leaves that sway from the stem
      return (
        <>
          {[-70, -35, 0, 35, 70].map((a, i) => (
            <g key={a} transform={`rotate(${a} 200 210)`}>
              <g className="art-sway" style={{ ...delay(i * 0.5), transformOrigin: "200px 260px" }}>
                <ellipse
                  cx="200"
                  cy="150"
                  rx="34"
                  ry="112"
                  fill="currentColor"
                  fillOpacity={0.06 + i * 0.03}
                  opacity={0.85}
                />
              </g>
            </g>
          ))}
          <path d="M200 260 L200 140" strokeWidth="2" opacity="0.7" />
        </>
      );
    case "meridian": // dashboard: grid, a line that draws itself, a pulsing point
      return (
        <>
          {[60, 110, 160, 210, 260].map((y) => (
            <line key={y} x1="20" x2="380" y1={y} y2={y} opacity="0.18" />
          ))}
          <path
            d="M20 220 L70 190 L120 200 L170 140 L220 160 L270 90 L320 110 L380 50 L380 280 L20 280 Z"
            fill="currentColor"
            fillOpacity="0.12"
            stroke="none"
            className="art-twinkle"
            style={{ ...delay(0), animationDuration: "5s" }}
          />
          <path
            d="M20 220 L70 190 L120 200 L170 140 L220 160 L270 90 L320 110 L380 50"
            pathLength="1"
            strokeWidth="2.5"
            className="art-draw"
          />
          <circle cx="270" cy="90" r="6" fill="currentColor" className="art-pulse" />
        </>
      );
    default: // cinder: a bean with a slow-turning ember halo
      return (
        <>
          <g transform="rotate(28 200 150)">
            <ellipse cx="200" cy="150" rx="88" ry="118" fill="currentColor" fillOpacity="0.1" className="art-pulse" />
          </g>
          <path d="M150 60 C210 110 150 190 250 240" pathLength="1" strokeWidth="5" strokeLinecap="round" opacity="0.8" className="art-draw" />
          <g className="art-spin" style={{ animationDuration: "30s" }}>
            <ellipse cx="200" cy="150" rx="118" ry="150" opacity="0.3" strokeDasharray="4 10" />
          </g>
        </>
      );
  }
}
