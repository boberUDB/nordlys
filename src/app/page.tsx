import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { Magnetic } from "@/components/magnetic";
import { StaggerText } from "@/components/stagger-text";
import { Reveal } from "@/components/reveal";
import { ScrollFade } from "@/components/scroll-fade";
import { Marquee } from "@/components/marquee";
import { Chapter } from "@/components/home/chapter";
import { WorkGallery } from "@/components/home/work-gallery";
import { Manifesto } from "@/components/home/manifesto";
import { Closing } from "@/components/home/closing";

export default function Home() {
  return (
    <>
      <section
        id="hero"
        data-story="hero"
        className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden pb-14 pt-[var(--nav-h)] sm:pb-20"
      >
        <ScrollFade className="relative z-10 mx-auto w-full max-w-[1400px] px-5 sm:px-8">
          <span className="mb-6 block font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--text-muted)]">
            Estudio de diseño e ingeniería · Desde 2021
          </span>
          <StaggerText
            as="h1"
            className="display max-w-[14ch] text-[clamp(2.7rem,7vw,6.6rem)] text-[var(--text)]"
            text="Construimos las ideas que otros estudios evitan."
          />
          <Reveal delay={0.5}>
            <p className="mt-7 max-w-[46ch] text-lg text-[var(--text-muted)]">
              Nordlys es un estudio pequeño de diseño e ingeniería: sitios, productos y experiencias
              tridimensionales para marcas exigentes.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Magnetic>
                <Link
                  href="/work"
                  className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] px-6 py-3.5 text-sm font-medium"
                  style={{ background: "var(--accent)", color: "var(--accent-ink)" }}
                >
                  Ver el trabajo
                  <ArrowUpRight size={15} weight="bold" />
                </Link>
              </Magnetic>
              <Magnetic>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] border px-6 py-3.5 text-sm font-medium text-[var(--text)]"
                  style={{ borderColor: "var(--line-strong)" }}
                >
                  Iniciar un proyecto
                </Link>
              </Magnetic>
            </div>
          </Reveal>
        </ScrollFade>

        <div
          aria-hidden
          className="absolute bottom-6 right-5 z-10 hidden items-center gap-3 font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--text-faint)] sm:right-8 md:flex"
        >
          <span className="[@media(hover:none)]:hidden">Mueve el cursor · haz clic</span>
          <span className="h-px w-8" style={{ background: "var(--line-strong)" }} />
          <span>Scroll</span>
        </div>
      </section>

      <Marquee items={["Identidad", "Producto", "Web 3D", "Motion", "Sistemas"]} />

      <Chapter
        storyKey="identity"
        index="01"
        kicker="Identidad y marca"
        title="Una marca que se sostiene fuera de la pantalla."
        body="Empezamos por lo que la marca dice cuando nadie la está mirando: tipografía, color y un lenguaje de movimiento propio, pensados para vivir en una pantalla, en un empaque o en una sala."
        material="Líquida"
        points={["Naming y voz", "Sistema tipográfico y color", "Lenguaje de movimiento", "Empaque y fotografía"]}
        side="right"
      />

      <Chapter
        storyKey="product"
        index="02"
        kicker="Producto y diseño de sistemas"
        title="Producto que se prueba con datos, no con opiniones."
        body="Interfaces que se prueban con datos reales, no con la opinión más fuerte en la sala. Un sistema de diseño que el equipo puede seguir extendiendo sin nosotros."
        material="Facetada"
        points={["Investigación con usuarios", "Sistemas de diseño", "Prototipos que funcionan", "Tokens de diseño a código"]}
        side="left"
      />

      <Chapter
        storyKey="web3d"
        index="03"
        kicker="Web 3D e ingeniería"
        title="Shaders a medida, solo cuando la idea lo pide."
        body="React Three Fiber, WebGL y shaders a medida cuando la idea realmente lo necesita, nunca por defecto. Con versión ligera para móvil y alternativa estática para quien no puede o no quiere movimiento."
        material="Malla holográfica"
        points={["React Three Fiber", "Shaders GLSL", "Rendimiento en móvil", "Alternativas accesibles"]}
        side="right"
      />

      <WorkGallery />
      <Manifesto />
      <Closing />
    </>
  );
}
