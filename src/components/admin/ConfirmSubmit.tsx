"use client";

/** Submit button that asks before firing — for destructive form actions. */
export default function ConfirmSubmit({
  message,
  children,
  className = "",
}: {
  message: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="submit"
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
      className={className}
    >
      {children}
    </button>
  );
}
