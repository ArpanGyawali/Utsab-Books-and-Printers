"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";

/**
 * Two short vertical clips shot in the shop, framed like the photo prints in
 * the story section above. Nothing loads until the visitor taps play
 * (preload="none" + poster), so the page stays light on mobile data. The
 * clips carry speech, so no muted autoplay — a deliberate tap starts them,
 * and starting one pauses the other.
 */

const VIDEOS = [
  {
    key: "v1",
    src: "/videos/shop1.mp4",
    poster: "/videos/shop1-poster.jpg",
    tilt: "-rotate-1",
  },
  {
    key: "v2",
    src: "/videos/shop2.mp4",
    poster: "/videos/shop2-poster.jpg",
    tilt: "rotate-[1.25deg]",
  },
] as const;

export default function ShopVideos() {
  const t = useTranslations("home.videos");
  const refs = useRef<Record<string, HTMLVideoElement | null>>({});
  const [started, setStarted] = useState<Record<string, boolean>>({});

  function start(key: string) {
    refs.current[key]?.play();
  }

  function onPlay(key: string) {
    setStarted((s) => (s[key] ? s : { ...s, [key]: true }));
    // One voice at a time — starting a clip pauses the other.
    for (const [k, video] of Object.entries(refs.current)) {
      if (k !== key) video?.pause();
    }
  }

  return (
    <div className="mx-auto mt-6 grid max-w-lg grid-cols-2 items-start gap-4 sm:gap-8">
      {VIDEOS.map(({ key, src, poster, tilt }) => {
        const caption = t(`${key}.caption`);
        return (
          <figure
            key={key}
            className={`rounded-sm border border-[var(--ink-faint)] bg-paper p-1.5 pb-2 shadow-[var(--shadow-card)] sm:p-2 sm:pb-3 ${tilt}`}
          >
            <div className="relative overflow-hidden rounded-[1px]">
              <video
                ref={(el) => {
                  refs.current[key] = el;
                }}
                src={src}
                poster={poster}
                preload="none"
                playsInline
                controls={Boolean(started[key])}
                onPlay={() => onPlay(key)}
                className="aspect-[406/720] w-full bg-paper-shade object-cover"
              />
              {!started[key] ? (
                <button
                  type="button"
                  onClick={() => start(key)}
                  aria-label={t("play", { caption })}
                  className="group absolute inset-0 flex items-center justify-center"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-full border-[1.5px] border-ink bg-paper/90 shadow-[var(--shadow-card)] transition-transform duration-150 group-hover:scale-105 sm:h-14 sm:w-14">
                    <svg
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                      className="ml-1 h-5 w-5 fill-ink sm:h-6 sm:w-6"
                    >
                      <path d="M7 4.5v15l13-7.5z" />
                    </svg>
                  </span>
                </button>
              ) : null}
            </div>
            <figcaption className="px-1 pt-2 text-center font-heading text-sm italic leading-snug text-ink-soft">
              {caption}
            </figcaption>
          </figure>
        );
      })}
    </div>
  );
}
