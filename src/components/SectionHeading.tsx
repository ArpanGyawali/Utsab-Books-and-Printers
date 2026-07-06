import InkAccent from "./InkAccent";

export default function SectionHeading({
  kicker,
  children,
  className = "",
}: {
  kicker?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`mb-6 ${className}`}>
      {kicker ? (
        <p className="mb-1 text-sm font-medium uppercase tracking-widest text-accent">
          {kicker}
        </p>
      ) : null}
      <h2 className="text-2xl font-semibold sm:text-3xl">{children}</h2>
      <InkAccent variant="underline" className="mt-2 h-2.5 w-28 text-accent" />
    </div>
  );
}
