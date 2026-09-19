"use client";

import { useState } from "react";
import { CheckCircle } from "@phosphor-icons/react";
import { story } from "@/lib/story";

type Errors = Partial<Record<"name" | "email" | "message", string>>;

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const message = String(form.get("message") ?? "").trim();

    const next: Errors = {};
    if (!name) next.name = "Cuéntanos tu nombre.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "Escribe un correo válido.";
    if (message.length < 10) next.message = "Danos un poco más de contexto.";

    setErrors(next);
    if (Object.keys(next).length === 0) {
      story.click = true;
      setSubmitted(true);
    }
  }

  if (submitted) {
    return (
      <div
        className="flex items-center gap-3 rounded-[var(--radius-md)] border px-6 py-5"
        style={{ borderColor: "var(--line)", background: "var(--bg-elevated)" }}
      >
        <CheckCircle size={22} weight="fill" className="shrink-0" style={{ color: "var(--accent)" }} />
        <p className="text-[var(--text)]">
          Recibido. Solemos responder dentro de dos días hábiles.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <Field label="Nombre" name="name" error={errors.name}>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          aria-invalid={!!errors.name}
          aria-describedby="name-error"
          className="field-input"
        />
      </Field>

      <Field label="Correo" name="email" error={errors.email}>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          aria-invalid={!!errors.email}
          aria-describedby="email-error"
          className="field-input"
        />
      </Field>

      <Field label="Cuéntanos del proyecto" name="message" error={errors.message}>
        <textarea
          id="message"
          name="message"
          rows={5}
          aria-invalid={!!errors.message}
          aria-describedby="message-error"
          className="field-input resize-none"
        />
      </Field>

      <button
        type="submit"
        className="mt-2 inline-flex w-fit items-center gap-2 rounded-[var(--radius-pill)] px-6 py-3.5 text-sm font-medium"
        style={{ background: "var(--accent)", color: "var(--accent-ink)" }}
      >
        Enviar
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  error,
  children,
}: {
  label: string;
  name: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={name} className="text-sm text-[var(--text-muted)]">
        {label}
      </label>
      {children}
      <span
        id={`${name}-error`}
        role={error ? "alert" : undefined}
        className="min-h-[1.1em] text-xs"
        style={{ color: "var(--danger)" }}
      >
        {error}
      </span>
    </div>
  );
}
