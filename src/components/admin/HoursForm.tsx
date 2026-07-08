"use client";

import { useActionState, useState } from "react";
import Button from "@/components/Button";
import {
  saveHours,
  type SettingsState,
} from "@/app/admin/(panel)/settings/actions";
import type { WeekHours } from "@/lib/site";

const DAYS = [
  { field: "sun", label: "Sunday" },
  { field: "mon", label: "Monday" },
  { field: "tue", label: "Tuesday" },
  { field: "wed", label: "Wednesday" },
  { field: "thu", label: "Thursday" },
  { field: "fri", label: "Friday" },
  { field: "sat", label: "Saturday" },
] as const;

const timeCls =
  "rounded-sm border-[1.5px] border-[var(--ink-faint)] bg-paper px-2 py-2 text-ink " +
  "focus-visible:border-ink disabled:opacity-40";

/** Weekly opening-hours editor — a row per day, closed toggle per row. */
export default function HoursForm({ initial }: { initial: WeekHours }) {
  const [state, formAction, pending] = useActionState<SettingsState, FormData>(
    saveHours,
    null
  );
  const [closed, setClosed] = useState<boolean[]>(initial.map((d) => d === null));

  return (
    <form
      action={formAction}
      className="rounded-md border border-[var(--ink-faint)] bg-paper p-4 shadow-[var(--shadow-card)]"
    >
      <h2 className="font-semibold">Opening hours</h2>
      <p className="mt-0.5 text-sm text-ink-soft">
        Shown in the footer and on the contact page; the “open now” dot follows
        these too.
      </p>

      <div className="mt-3 grid gap-2">
        {DAYS.map(({ field, label }, i) => (
          <div key={field} className="flex flex-wrap items-center gap-2">
            <span className="w-24 text-sm font-medium">{label}</span>
            <input
              type="time"
              name={`${field}_open`}
              defaultValue={initial[i]?.open ?? "06:30"}
              disabled={closed[i]}
              aria-label={`${label} opening time`}
              className={timeCls}
            />
            <span className="text-ink-soft">–</span>
            <input
              type="time"
              name={`${field}_close`}
              defaultValue={initial[i]?.close ?? "19:30"}
              disabled={closed[i]}
              aria-label={`${label} closing time`}
              className={timeCls}
            />
            <label className="flex min-h-11 items-center gap-1.5 text-sm">
              <input
                type="checkbox"
                name={`${field}_closed`}
                checked={closed[i]}
                onChange={(e) =>
                  setClosed((c) => c.map((v, j) => (j === i ? e.target.checked : v)))
                }
                className="h-4 w-4 accent-[var(--accent)]"
              />
              Closed
            </label>
          </div>
        ))}
      </div>

      {state && "error" in state ? (
        <p role="alert" className="mt-3 text-sm font-medium text-outofstock">
          {state.error}
        </p>
      ) : null}
      {state && "ok" in state ? (
        <p className="mt-3 text-sm font-medium text-instock">Saved — the site is updated.</p>
      ) : null}

      <Button type="submit" disabled={pending} className="mt-3">
        {pending ? "Saving…" : "Save hours"}
      </Button>
    </form>
  );
}
