"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { List, X, ArrowUpRight } from "@phosphor-icons/react";
import { SettingsMenu } from "@/components/settings-menu";
import { Magnetic } from "@/components/magnetic";

const LINKS = [
  { href: "/work", label: "Work" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Nav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <header
      className="fixed inset-x-0 top-0 z-50 border-b transition-colors duration-300"
      style={{
        height: "var(--nav-h)",
        borderColor: scrolled ? "var(--line)" : "transparent",
        background: scrolled ? "color-mix(in srgb, var(--bg) 82%, transparent)" : "transparent",
        backdropFilter: scrolled ? "blur(14px) saturate(140%)" : "none",
      }}
    >
      <div className="mx-auto flex h-full max-w-[1400px] items-center justify-between px-5 sm:px-8">
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

        <nav className="hidden items-center gap-8 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
              aria-current={pathname === l.href ? "page" : undefined}
              style={pathname === l.href ? { color: "var(--text)" } : undefined}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Magnetic strength={0.4}>
            <Link
              href="/contact"
              className="hidden items-center gap-1.5 rounded-[var(--radius-pill)] border border-[var(--line-strong)] px-4 py-2 text-sm text-[var(--text)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)] sm:flex"
            >
              Iniciar un proyecto
              <ArrowUpRight size={14} weight="bold" />
            </Link>
          </Magnetic>
          <div className="hidden md:block">
            <SettingsMenu />
          </div>
          <button
            type="button"
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--line)] text-[var(--text)] md:hidden"
          >
            {menuOpen ? <X size={18} /> : <List size={18} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div
          className="border-t md:hidden"
          style={{ borderColor: "var(--line)", background: "var(--bg)" }}
        >
          <nav className="flex flex-col px-5 py-4">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="py-3 text-base text-[var(--text)]"
              >
                {l.label}
              </Link>
            ))}
            <div className="mt-2 flex items-center justify-between border-t pt-4" style={{ borderColor: "var(--line)" }}>
              <span className="text-sm text-[var(--text-muted)]">Configuración</span>
              <SettingsMenu />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
