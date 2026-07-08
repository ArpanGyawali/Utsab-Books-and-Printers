import { site } from "./site";

/**
 * WhatsApp / Viber deep-link builders — the ONLY place that touches the
 * shop's contact numbers (per SKILL.md). Message text comes from the
 * caller, already localized via the messages files.
 */

export function waLink(message: string): string {
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(message)}`;
}

/**
 * Owner → customer WhatsApp link (admin waiting list / quotes inbox).
 * `phone` is a normalized 10-digit Nepali mobile (see normalizeNepaliMobile).
 */
export function waLinkToCustomer(phone: string, message: string): string {
  return `https://wa.me/977${phone}?text=${encodeURIComponent(message)}`;
}

export function viberLink(): string {
  // Viber ignores prefilled text; deep link opens the chat only.
  return `viber://chat?number=%2B${site.whatsapp}`;
}

export function telLink(): string {
  return `tel:${site.phone.replace(/[^+\d]/g, "")}`;
}
