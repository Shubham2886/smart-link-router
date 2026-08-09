export default function Logo({ className = "h-7 w-7", withWordmark = false, dark = false }) {
  return (
    <span className="inline-flex items-center gap-2">
      <svg
        viewBox="0 0 32 32"
        className={className}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M4 16 H12"
          stroke={dark ? "#EEF0EC" : "#14161B"}
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <path d="M12 16 L22 6" stroke="#4F7CE8" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M12 16 L22 16" stroke="#57B06B" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M12 16 L22 26" stroke="#D3922F" strokeWidth="2.4" strokeLinecap="round" />
        <circle cx="12" cy="16" r="3" fill="#FF5A36" />
        <circle cx="22" cy="6" r="2" fill="#4F7CE8" />
        <circle cx="22" cy="16" r="2" fill="#57B06B" />
        <circle cx="22" cy="26" r="2" fill="#D3922F" />
      </svg>
      {withWordmark && (
        <span className={`font-display font-semibold text-lg tracking-tight ${dark ? "text-paper" : "text-ink-900"}`}>
          Routely
        </span>
      )}
    </span>
  );
}
