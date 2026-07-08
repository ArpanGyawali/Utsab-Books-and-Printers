"use client";

import { useState } from "react";
import Button from "@/components/Button";

/**
 * Admin login — magic link only, no passwords. The server decides whether an
 * email gets a link; this form gives the same answer either way.
 */
export default function AdminLoginPage() {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get("email") ?? "").trim();
    if (!email) return;

    setState("sending");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setState(res.ok ? "sent" : "error");
    } catch {
      setState("error");
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-5 py-10">
      {/* StampLogo needs the intl provider; admin is English-only, so inline the mark. */}
      <span className="stamp-border mb-8 inline-block -rotate-1 select-none self-center px-3 py-1.5 text-sm font-bold uppercase tracking-[0.12em] text-[var(--stamp)] sm:text-base">
        Utsab Books and Printers
      </span>
      <h1 className="text-2xl font-semibold">Shop admin</h1>

      {state === "sent" ? (
        <p className="mt-4 rounded-sm border-[1.5px] border-dashed border-[var(--ink-faint)] bg-paper-shade/60 px-4 py-3 text-sm">
          If that is the admin email, a login link is on its way. Open the
          email on this phone and tap the link.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="mt-5 grid gap-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Email</span>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              inputMode="email"
              className="w-full rounded-sm border-[1.5px] border-[var(--ink-faint)] bg-paper px-3 py-2.5 text-ink focus-visible:border-ink"
            />
          </label>
          {state === "error" ? (
            <p role="alert" className="text-sm font-medium text-outofstock">
              Could not send the link — wait a minute and try again.
            </p>
          ) : null}
          <Button type="submit" disabled={state === "sending"}>
            {state === "sending" ? "Sending…" : "Email me a login link"}
          </Button>
          <p className="text-xs text-ink-soft">
            No password. You get an email with a one-tap login link.
          </p>
        </form>
      )}
    </main>
  );
}
