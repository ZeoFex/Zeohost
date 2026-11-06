function Mark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect width="64" height="64" rx="15" fill="#07131F" />
      <rect
        x="2.5"
        y="2.5"
        width="59"
        height="59"
        rx="13.5"
        stroke="#1A3A52"
        strokeWidth="1.25"
        fill="none"
      />
      <path
        d="M15 17h34a2 2 0 0 1 1.5 3.3L26.2 41H49a2 2 0 1 1 0 4H15a2 2 0 0 1-1.5-3.3L37.8 21H15a2 2 0 1 1 0-4Z"
        fill="#F7FAFC"
      />
      <circle cx="49" cy="15" r="6" fill="#00C2D4" />
      <circle cx="49" cy="15" r="2.4" fill="#07131F" />
    </svg>
  );
}

export function Brand({
  light = false,
  size = "md",
}: {
  light?: boolean;
  size?: "md" | "lg";
}) {
  const large = size === "lg";
  return (
    <div className={`brand ${large ? "is-lg" : ""} ${light ? "is-light" : ""}`}>
      <Mark className="brand-mark" />
      <span className="brand-word">
        <span className="brand-my">Zeo</span>host
      </span>
    </div>
  );
}
