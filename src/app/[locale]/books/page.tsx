import { setRequestLocale } from "next-intl/server";
import { use } from "react";
import StubPage from "@/components/StubPage";

// Look for Book (the differentiator) lands in Phase 3 with Supabase.
export default function BooksPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  setRequestLocale(locale);
  return <StubPage page="books" />;
}
