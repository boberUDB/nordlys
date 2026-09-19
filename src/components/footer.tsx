import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";

export function Footer() {
  return (
    <footer
      className="relative z-10 border-t"
      style={{ borderColor: "var(--line)" }}
    >
      <div className="mx-auto max-w-[1400px] px-5 py-20 sm:px-8">
        <div className="flex flex-col gap-12 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Link
              href="/"
              className="flex items-center gap-2 text-[15px] font-medium tracking-tight"
            >
              <span
                aria-hidden
                className="h-2 w-2 rounded-full"
                style={{ background: "var(--aurora)" }}
              />
              nordlys
            </Link>
            <p className="mt-4 max-w-[32ch] text-sm text-[var(--text-muted)]">
              Un estudio pequeño de diseño e ingeniería para marcas que
              quieren algo más difícil de copiar.
            </p>
          </div>

          <div className="flex flex-wrap gap-16">
            <div>
              <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--text-faint)]">
                Estudio
              </span>
              <ul className="mt-4 flex flex-col gap-2.5">
                <li>
                  <Link href="/work" className="text-sm text-[var(--text-muted)] hover:text-[var(--text)]">
                    Work
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-sm text-[var(--text-muted)] hover:text-[var(--text)]">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-sm text-[var(--text-muted)] hover:text-[var(--text)]">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--text-faint)]">
                Contacto
              </span>
              <ul className="mt-4 flex flex-col gap-2.5">
                <li>
                  <a
                    href="mailto:studio@nordlys.work"
                    className="flex items-center gap-1 text-sm text-[var(--text-muted)] hover:text-[var(--text)]"
                  >
                    studio@nordlys.work
                    <ArrowUpRight size={13} />
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="flex items-center gap-1 text-sm text-[var(--text-muted)] hover:text-[var(--text)]"
                  >
                    Instagram
                    <ArrowUpRight size={13} />
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div
          className="mt-16 flex flex-col gap-2 border-t pt-6 text-xs text-[var(--text-faint)] sm:flex-row sm:items-center sm:justify-between"
          style={{ borderColor: "var(--line)" }}
        >
          <span>© {new Date().getFullYear()} Nordlys Studio.</span>
          <span>Diseño e ingeniería, en la misma sala.</span>
        </div>
      </div>
    </footer>
  );
}
