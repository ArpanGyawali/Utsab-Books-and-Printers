import Image from "next/image";

/**
 * Branded intro splash — a full-screen paper overlay where the seal stamps
 * in, shown at most once per tab session (and only to returning visitors;
 * first-ever visits get the LanguageGate instead). Rendered on every page
 * but display:none unless the inline gate script in the locale layout adds
 * `intro` to <html>. The entire show/hide lifecycle is CSS in
 * styles/motion.css: the seal stamps in, its ring settles, and the overlay
 * fades itself out by ~1.5s total — never intercepts taps, and doesn't exist
 * for reduced-motion users.
 */
export default function IntroLoader() {
  return (
    <div aria-hidden="true" className="intro-loader">
      <span className="intro-mark">
        <Image
          src="/images/logo.png"
          alt=""
          width={80}
          height={80}
          sizes="80px"
          className="h-20 w-20 select-none"
        />
      </span>
    </div>
  );
}
