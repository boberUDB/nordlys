import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — Nordlys",
  description: "Cómo trabaja Nordlys y quién forma el estudio.",
};

const TEAM = [
  { name: "Sofía Lindqvist", role: "Dirección de diseño", initials: "SL" },
  { name: "Mateo Bruno", role: "Dirección de ingeniería", initials: "MB" },
  { name: "Adaeze Okoro", role: "3D y motion", initials: "AO" },
  { name: "Theo Marsh", role: "Producción y cuentas", initials: "TM" },
];

const PRINCIPLES = [
  {
    title: "Un equipo, no un pipeline",
    body: "La persona que diseña la interacción es, casi siempre, la misma que la construye. Eso evita que las ideas se pierdan al cruzar de Figma a código.",
  },
  {
    title: "El 3D es una herramienta, no una firma",
    body: "Lo usamos cuando resuelve algo que el diseño plano no puede. Si el sitio funciona mejor sin él, lo quitamos, aunque se vea impresionante en el portafolio.",
  },
  {
    title: "Cuatro proyectos a la vez, como máximo",
    body: "Preferimos decir que no a un quinto cliente antes que diluir la atención en los otros cuatro.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-[1400px] px-5 pb-24 pt-[calc(var(--nav-h)+48px)] sm:px-8">
      <div className="max-w-[62ch]">
        <h1 className="text-[clamp(2rem,4vw,3rem)] font-medium tracking-tight text-[var(--text)]">
          Cuatro personas, sin intermediarios entre la idea y el código.
        </h1>
        <p className="mt-6 text-lg text-[var(--text-muted)]">
          Nordlys empezó en 2021 como dos freelancers compartiendo un
          proyecto de cliente. Hoy seguimos siendo pequeños a propósito:
          suficiente equipo para llevar algo de identidad a producto en
          producción, no tanto como para necesitar una capa de gestión
          entre nosotros y el trabajo.
        </p>
      </div>

      <div className="mt-20 flex flex-col" style={{ borderColor: "var(--line)" }}>
        {PRINCIPLES.map((p) => (
          <div
            key={p.title}
            className="grid grid-cols-1 gap-3 border-t py-9 sm:grid-cols-[1fr_2fr] sm:gap-10"
            style={{ borderColor: "var(--line)" }}
          >
            <h2 className="text-lg font-medium text-[var(--text)]">{p.title}</h2>
            <p className="max-w-[58ch] text-[var(--text-muted)]">{p.body}</p>
          </div>
        ))}
        <div className="border-t" style={{ borderColor: "var(--line)" }} />
      </div>

      <div className="mt-24">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--text-faint)]">
          El equipo
        </h2>
        <div className="mt-6 grid grid-cols-1 gap-px sm:grid-cols-2 lg:grid-cols-4" style={{ background: "var(--line)" }}>
          {TEAM.map((t) => (
            <div key={t.name} className="flex flex-col gap-4 p-6" style={{ background: "var(--bg)" }}>
              <div
                className="flex h-12 w-12 items-center justify-center rounded-full font-mono text-sm font-medium"
                style={{ background: "var(--bg-elevated-2)", color: "var(--accent)" }}
                aria-hidden
              >
                {t.initials}
              </div>
              <div>
                <p className="font-medium text-[var(--text)]">{t.name}</p>
                <p className="text-sm text-[var(--text-muted)]">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
