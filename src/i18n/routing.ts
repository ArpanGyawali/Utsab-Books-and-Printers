import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "ne"],
  defaultLocale: "ne",
  localePrefix: "always",
});

export type Locale = (typeof routing.locales)[number];
