import { setRequestLocale } from "next-intl/server";
import { use } from "react";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import Container from "@/components/Container";
import InkAccent from "@/components/InkAccent";
import RuledDivider from "@/components/RuledDivider";
import SectionHeading from "@/components/SectionHeading";
import StampLogo from "@/components/StampLogo";

/*
 * THROWAWAY dev page for reviewing design tokens on a real phone.
 * Not linked from anywhere; delete before launch (Phase 5).
 * Hardcoded strings are fine here — it never ships to users.
 */

const colors = [
  ["--paper", "paper"],
  ["--paper-shade", "paper-shade"],
  ["--ink", "ink"],
  ["--ink-soft", "ink-soft"],
  ["--accent", "accent"],
  ["--accent-deep", "accent-deep"],
  ["--status-in-stock", "status: in stock"],
  ["--status-arriving", "status: arriving"],
  ["--status-out-of-stock", "status: out of stock"],
] as const;

export default function TokensPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  setRequestLocale(locale);

  return (
    <Container className="space-y-12 py-12">
      <SectionHeading kicker="dev only — delete before launch">
        Design tokens
      </SectionHeading>

      <section>
        <h3 className="mb-4 text-lg font-semibold">Palette</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {colors.map(([varName, label]) => (
            <div
              key={varName}
              className="overflow-hidden rounded-md border border-[var(--ink-faint)]"
            >
              <div
                className="h-16"
                style={{ backgroundColor: `var(${varName})` }}
              />
              <div className="bg-paper px-3 py-2 text-xs">
                <p className="font-medium">{label}</p>
                <p className="text-ink-soft">{varName}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-4 text-lg font-semibold">Type — both scripts</h3>
        <div className="space-y-4">
          <h1 className="text-4xl font-semibold">
            Schoolbooks, sharpened pencils &amp; fresh paper
          </h1>
          <h1 className="text-4xl font-semibold">
            किताब, कापी–कलम र नयाँ कागजको सुगन्ध
          </h1>
          <p className="max-w-xl">
            Body text — The quick brown fox jumps over the lazy dog. 0123456789.
            Utsab Books and Printers, Ranibagiya, Sainamaina-1, Rupandehi.
          </p>
          <p className="max-w-xl">
            बडी टेक्स्ट — नर्सरीदेखि कक्षा १२ सम्मका किताब हामीकहाँ पाइन्छ।
            मूल्य: रु. 450। स्टकमा छ कि छैन तलको ब्याजमा हेर्नुहोस्।
          </p>
          <p className="max-w-xl text-sm text-ink-soft">
            Soft ink small text / सानो अक्षरको नमूना — 44px tap targets, 360px
            first.
          </p>
        </div>
      </section>

      <section>
        <h3 className="mb-4 text-lg font-semibold">Status badges (stamp)</h3>
        <div className="flex flex-wrap gap-4">
          <Badge status="in_stock" />
          <Badge status="arriving" />
          <Badge status="out_of_stock" />
        </div>
      </section>

      <section>
        <h3 className="mb-4 text-lg font-semibold">Buttons</h3>
        <div className="flex flex-wrap gap-4">
          <Button href="/">Primary / किताब खोज्नुहोस्</Button>
          <Button href="/" variant="secondary">
            Secondary / हाम्रा सेवाहरू
          </Button>
        </div>
      </section>

      <section>
        <h3 className="mb-4 text-lg font-semibold">Stamp lockup</h3>
        <div className="flex flex-wrap items-center gap-6">
          <StampLogo size="lg" />
          <StampLogo size="sm" />
        </div>
      </section>

      <section>
        <h3 className="mb-4 text-lg font-semibold">Ruled divider + ink accents</h3>
        <RuledDivider />
        <div className="mt-6 flex items-center gap-8 text-accent">
          <InkAccent variant="underline" className="h-3 w-32" />
          <InkAccent variant="star" className="h-6 w-6" />
          <InkAccent variant="book" className="h-6 w-9" />
        </div>
      </section>

      <section>
        <h3 className="mb-4 text-lg font-semibold">Card shadow ceiling</h3>
        <div className="max-w-xs rounded-md bg-paper p-4 shadow-[var(--shadow-card)]">
          <p className="text-sm">
            Max allowed shadow: <code>0 1px 3px</code> — anything heavier is a
            design-rule violation.
          </p>
        </div>
      </section>
    </Container>
  );
}
