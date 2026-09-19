import { StaggerText } from "@/components/stagger-text";
import { Reveal } from "@/components/reveal";
import { Parallax } from "@/components/parallax";

type Props = {
  /** matches a key in KEYFRAMES: drives what the 3D crystal does while this chapter is on screen */
  storyKey: "identity" | "product" | "web3d";
  index: string;
  kicker: string;
  title: string;
  body: string;
  material: string;
  points: string[];
  /** side of the screen the text sits on; the crystal takes the other one */
  side: "left" | "right";
};

/**
 * One chapter of the scroll story. The crystal behind changes shape for each one
 * (liquid, cut gem, holographic mesh), and the "material" tag says which.
 */
export function Chapter({ storyKey, index, kicker, title, body, material, points, side }: Props) {
  return (
    <section
      data-story={storyKey}
      className="relative flex min-h-[100svh] items-end pb-20 pt-[46svh] md:items-center md:py-24"
    >
      <div className="mx-auto w-full max-w-[1400px] px-5 sm:px-8">
        <div className={side === "right" ? "md:ml-[46%]" : "md:mr-[46%]"}>
          <Parallax speed={0.12} className="pointer-events-none select-none">
            <span
              aria-hidden
              className="display text-outline block text-[clamp(6rem,16vw,14rem)] leading-none opacity-70"
            >
              {index}
            </span>
          </Parallax>

          <div className="-mt-6 sm:-mt-10 md:-mt-14">
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--accent)]">
              {kicker}
            </span>
            <StaggerText
              as="h2"
              className="display mt-4 max-w-[16ch] text-[clamp(2rem,4.8vw,4.4rem)] text-[var(--text)]"
              text={title}
            />
            <Reveal stagger={0.09} className="mt-7">
              <p className="max-w-[46ch] text-lg leading-relaxed text-[var(--text-muted)]">{body}</p>
              <ul className="mt-8 grid max-w-[46ch] grid-cols-1 gap-x-8 gap-y-2.5 sm:grid-cols-2">
                {points.map((p) => (
                  <li
                    key={p}
                    className="flex items-center gap-2.5 border-t pt-2.5 text-sm text-[var(--text)]"
                    style={{ borderColor: "var(--line)" }}
                  >
                    <span
                      aria-hidden
                      className="h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ background: "var(--accent)" }}
                    />
                    {p}
                  </li>
                ))}
              </ul>
              <p className="mt-8 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--text-faint)]">
                <span>Forma</span>
                <span className="h-px w-8" style={{ background: "var(--line-strong)" }} />
                <span className="text-[var(--text-muted)]">{material}</span>
              </p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
