import { getTranslations } from "next-intl/server";
import Container from "@/components/Container";
import LogoSpinner from "@/components/LogoSpinner";

/**
 * Route loading state for /books — shown during client-side navigations
 * (search submits, filter chips) while the server fetches results.
 */
export default async function BooksLoading() {
  const t = await getTranslations("common");
  return (
    <Container className="flex min-h-[50vh] items-center justify-center py-12">
      <LogoSpinner label={t("loading")} />
    </Container>
  );
}
