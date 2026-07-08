"use client";

import { useTransition, type ReactNode } from "react";

/**
 * Waiting-list "Notify" link: opens the customer's WhatsApp chat (normal
 * anchor navigation to wa.me in a new tab) and, in parallel, runs the bound
 * server action that stamps the row as notified — one tap does both.
 */
export default function NotifyButton({
  href,
  action,
  children,
  className,
}: {
  href: string;
  action: () => Promise<void>;
  children: ReactNode;
  className?: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-disabled={pending}
      onClick={() => startTransition(async () => action())}
      className={className}
    >
      {children}
    </a>
  );
}
