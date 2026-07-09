import { notFound } from "next/navigation";

/** Any path that matches no real route under a locale → localized 404. */
export default function CatchAll() {
  notFound();
}
