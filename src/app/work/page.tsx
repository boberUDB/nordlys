import type { Metadata } from "next";
import { WorkList } from "./work-list";

export const metadata: Metadata = {
  title: "Work — Nordlys",
  description: "Proyectos seleccionados de Nordlys, estudio de diseño e ingeniería.",
};

export default function WorkPage() {
  return (
    <div data-story="worklist" className="mx-auto max-w-[1400px] px-5 pb-24 pt-[calc(var(--nav-h)+48px)] sm:px-8">
      <div className="mb-16 max-w-[60ch]">
        <h1 className="text-[clamp(2rem,4vw,3rem)] font-medium tracking-tight text-[var(--text)]">
          Trabajo.
        </h1>
        <p className="mt-4 text-lg text-[var(--text-muted)]">
          Seis proyectos, de identidad a producto a experiencias 3D en el
          navegador. Cada uno lleva una breve descripción de qué se trata.
        </p>
      </div>

      <WorkList />
    </div>
  );
}
