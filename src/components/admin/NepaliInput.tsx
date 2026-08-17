"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

/**
 * A Nepali text field the owner can type phonetically in: he types Roman
 * letters ("namaste") and a dropdown offers Devanagari words ("नमस्ते") — Space
 * or Enter commits the highlighted one, arrows change it, Esc keeps the Roman.
 * Devanagari that's typed or pasted directly passes straight through.
 *
 * Suggestions come from /api/admin/transliterate (Google Input Tools). If that
 * call fails or is slow, no dropdown appears and the field behaves like a plain
 * textbox — so typing never breaks. Submits its value via `name` like any input.
 */

const ENDPOINT = "/api/admin/transliterate";
const TRAILING_LATIN = /[a-zA-Z]+$/;

export default function NepaliInput({
  name,
  defaultValue = "",
  className,
  as = "input",
  rows,
  placeholder,
  required,
  id,
}: {
  name: string;
  defaultValue?: string;
  className?: string;
  as?: "input" | "textarea";
  rows?: number;
  placeholder?: string;
  required?: boolean;
  id?: string;
}) {
  const [value, setValue] = useState(defaultValue);
  const [candidates, setCandidates] = useState<string[]>([]);
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);

  const ref = useRef<HTMLInputElement & HTMLTextAreaElement>(null);
  const tokenRef = useRef(""); // latest trailing Latin word the user is typing
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abort = useRef<AbortController | null>(null);
  const pendingCaret = useRef<number | null>(null);

  // Restore the caret after a programmatic value change (commit).
  useLayoutEffect(() => {
    if (pendingCaret.current !== null && ref.current) {
      const pos = pendingCaret.current;
      ref.current.setSelectionRange(pos, pos);
      pendingCaret.current = null;
    }
  }, [value]);

  useEffect(() => () => abort.current?.abort(), []);

  function trailingLatin(el: HTMLInputElement | HTMLTextAreaElement) {
    const caret = el.selectionStart ?? el.value.length;
    const m = el.value.slice(0, caret).match(TRAILING_LATIN);
    return { token: m ? m[0] : "", caret };
  }

  function scheduleFetch(token: string) {
    tokenRef.current = token;
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => fetchCandidates(token), 130);
  }

  async function fetchCandidates(token: string) {
    abort.current?.abort();
    const ctrl = new AbortController();
    abort.current = ctrl;
    try {
      const res = await fetch(`${ENDPOINT}?text=${encodeURIComponent(token)}`, {
        signal: ctrl.signal,
      });
      const data: { candidates: string[] } = await res.json();
      // Ignore stale responses (the user typed on).
      if (tokenRef.current !== token) return;
      setCandidates(data.candidates);
      setActive(0);
      setOpen(data.candidates.length > 0);
    } catch {
      // Aborted or network error — leave the Roman text as-is.
    }
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setValue(e.target.value);
    const { token } = trailingLatin(e.target);
    if (token) scheduleFetch(token);
    else {
      tokenRef.current = "";
      setOpen(false);
      setCandidates([]);
    }
  }

  /** Replace the trailing Latin word at the caret with a Devanagari choice. */
  function commit(word: string, addSpace: boolean) {
    const el = ref.current;
    if (!el) return;
    const { token, caret } = trailingLatin(el);
    if (!token) {
      setOpen(false);
      return;
    }
    const start = caret - token.length;
    const insert = word + (addSpace ? " " : "");
    setValue((v) => v.slice(0, start) + insert + v.slice(caret));
    pendingCaret.current = start + insert.length;
    tokenRef.current = "";
    setOpen(false);
    setCandidates([]);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (!open || candidates.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (a + 1) % candidates.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (a - 1 + candidates.length) % candidates.length);
    } else if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      commit(candidates[active], false);
    } else if (e.key === " ") {
      e.preventDefault();
      commit(candidates[active], true);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  const Tag = as;

  return (
    <span className="relative block">
      <Tag
        ref={ref}
        id={id}
        name={name}
        value={value}
        rows={as === "textarea" ? rows : undefined}
        placeholder={placeholder}
        required={required}
        lang="ne"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        className={className}
        onChange={onChange}
        onKeyDown={onKeyDown}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
      />
      {open ? (
        <ul
          role="listbox"
          className="absolute left-0 top-full z-20 mt-1 max-h-56 min-w-[10rem] overflow-auto rounded-sm border border-ink bg-paper py-1 shadow-[var(--shadow-lift)]"
        >
          {candidates.map((word, i) => (
            <li key={word} role="option" aria-selected={i === active}>
              <button
                type="button"
                // Fire before blur so the click always registers.
                onMouseDown={(e) => {
                  e.preventDefault();
                  commit(word, false);
                }}
                className={`block w-full px-3 py-1.5 text-left text-base ${
                  i === active ? "bg-ink text-paper" : "text-ink hover:bg-paper-shade"
                }`}
              >
                {word}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </span>
  );
}
