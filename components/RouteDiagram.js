import { Apple, Smartphone, Monitor } from "lucide-react";

export default function RouteDiagram() {
  return (
    <div className="relative w-full max-w-md mx-auto">
      <svg viewBox="0 0 340 220" className="w-full h-auto" aria-hidden="true">
        <path d="M20 110 H120" stroke="#C3C7CE" strokeWidth="2" fill="none" />
        <path d="M120 110 L260 30" stroke="#4F7CE8" strokeWidth="2" fill="none" />
        <path d="M120 110 L260 110" stroke="#57B06B" strokeWidth="2" fill="none" />
        <path d="M120 110 L260 190" stroke="#D3922F" strokeWidth="2" fill="none" />

        {/* traveling pulses along each route */}
        <circle r="3.5" fill="#FF5A36">
          <animateMotion dur="2.6s" repeatCount="indefinite" path="M20 110 H120 L260 30" />
        </circle>
        <circle r="3.5" fill="#FF5A36">
          <animateMotion dur="2.6s" begin="0.5s" repeatCount="indefinite" path="M20 110 H120 L260 110" />
        </circle>
        <circle r="3.5" fill="#FF5A36">
          <animateMotion dur="2.6s" begin="1s" repeatCount="indefinite" path="M20 110 H120 L260 190" />
        </circle>

        <circle cx="20" cy="110" r="5" fill="#14161B" />
        <circle cx="120" cy="110" r="6" fill="#FF5A36" />
      </svg>

      <div className="absolute inset-0">
        <div className="absolute" style={{ left: "5%", top: "44%" }}>
          <div className="bg-ink-900 text-paper-100 font-mono text-[11px] px-2.5 py-1 rounded-md -translate-y-1/2 shadow-lift">
            /l/app
          </div>
        </div>
        <RouteEndpoint style={{ left: "74%", top: "8%" }} Icon={Apple} color="#4F7CE8" label="iOS" />
        <RouteEndpoint style={{ left: "74%", top: "45%" }} Icon={Smartphone} color="#57B06B" label="Android" />
        <RouteEndpoint style={{ left: "74%", top: "82%" }} Icon={Monitor} color="#D3922F" label="Desktop" />
      </div>
    </div>
  );
}

function RouteEndpoint({ style, Icon, color, label }) {
  return (
    <div className="absolute -translate-y-1/2 flex items-center gap-2" style={style}>
      <span
        className="h-9 w-9 rounded-xl flex items-center justify-center shadow-panel bg-paper-100 border"
        style={{ borderColor: `${color}55` }}
      >
        <Icon size={16} style={{ color }} />
      </span>
      <span className="text-xs font-medium text-ink-600 hidden sm:inline">{label}</span>
    </div>
  );
}
