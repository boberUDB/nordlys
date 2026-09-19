import type { Metadata } from "next";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "Contact — Nordlys",
  description: "Cuéntanos sobre tu proyecto.",
};

export default function ContactPage() {
  return (
    <div data-story="contact" className="mx-auto max-w-[1400px] px-5 pb-24 pt-[calc(var(--nav-h)+48px)] sm:px-8">
      <div className="grid grid-cols-1 gap-16 lg:grid-cols-[1fr_1fr]">
        <div>
          <h1 className="max-w-[16ch] text-[clamp(2rem,4vw,3rem)] font-medium tracking-tight text-[var(--text)]">
            Cuéntanos del proyecto.
          </h1>
          <p className="mt-6 max-w-[46ch] text-lg text-[var(--text-muted)]">
            Tomamos entre tres y cuatro proyectos nuevos por trimestre.
            Cuéntanos qué estás construyendo y con qué plazo trabajas.
          </p>

          <div className="mt-12 flex flex-col gap-6">
            <div>
              <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--text-faint)]">
                Correo directo
              </span>
              <a
                href="mailto:studio@nordlys.work"
               
                className="mt-2 flex w-fit items-center gap-1.5 text-lg text-[var(--text)] hover:text-[var(--accent)]"
              >
                studio@nordlys.work
                <ArrowUpRight size={16} />
              </a>
            </div>
            <div>
              <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--text-faint)]">
                Tiempo de respuesta
              </span>
              <p className="mt-2 text-[var(--text)]">Dos días hábiles, normalmente antes.</p>
            </div>
          </div>
        </div>

        <ContactForm />
      </div>
    </div>
  );
}
