import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { productImageUrl, productName } from "@/lib/products";
import type { Product } from "@/lib/supabase/types";

/**
 * A stationery item shown as a taped photo print — same paper-&-ink language as
 * the services-page figures, sized for a dense grid. The whole card is a quiet
 * showcase: no inquire button, no stock badge; the price (when set) is a little
 * stamp on the corner, otherwise the item just says "come and ask".
 *
 * `index` drives the alternating tilt so a grid of prints looks hand-laid.
 * The tape overhangs the top edge, so the grid must leave headroom (pt-*) and
 * no ancestor between here and the grid may set `overflow-hidden`.
 */
export default function ProductCard({
  product,
  index,
}: {
  product: Product;
  index: number;
}) {
  const locale = useLocale();
  const t = useTranslations("stationery");
  const name = productName(product, locale);
  const src = productImageUrl(product);
  const tilt = index % 2 === 0 ? "-rotate-[0.7deg]" : "rotate-[0.7deg]";

  return (
    <li>
      <figure
        className={`relative rounded-sm border border-[var(--ink-faint)] bg-paper p-2 pb-2.5 shadow-[var(--shadow-card)] ${tilt} transition-[rotate,box-shadow] duration-[var(--dur-micro)] ease-soft motion-safe:hover:rotate-0 hover:shadow-[var(--shadow-lift)]`}
      >
        {/* Bit of tape holding the print to the page */}
        <span
          aria-hidden="true"
          className="absolute -top-2 left-1/2 h-4 w-12 -translate-x-1/2 rotate-[-3deg] rounded-[1px] border border-[var(--ink-faint)] bg-paper-shade/80"
        />

        <div className="relative aspect-square overflow-hidden rounded-[1px] bg-paper-shade/50">
          {src ? (
            <Image
              src={src}
              alt={t("imageAlt", { name })}
              fill
              sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 220px"
              className="object-cover"
            />
          ) : (
            /* Placeholder — faint initial until the owner uploads a photo */
            <div
              aria-hidden="true"
              className="flex h-full w-full select-none items-center justify-center border-[1.5px] border-dashed border-[var(--ink-faint)]"
            >
              <span className="text-5xl font-semibold text-ink-soft/30 [font-family:var(--font-heading)]">
                {name.charAt(0)}
              </span>
            </div>
          )}

          {/* Price sticker — only when priced; showcase items may just be "ask" */}
          {product.price !== null ? (
            <span className="absolute -bottom-1.5 -right-1 rotate-[2deg] rounded-[2px] border border-accent-deep bg-accent px-1.5 py-0.5 text-xs font-semibold tabular-nums text-paper shadow-[var(--shadow-card)]">
              {t("priceRs", { price: Number(product.price) })}
            </span>
          ) : null}
        </div>

        <figcaption className="px-1 pt-2.5 text-center font-heading text-[15px] italic leading-snug text-ink">
          {name}
        </figcaption>
      </figure>
    </li>
  );
}
