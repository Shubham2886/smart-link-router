import { Apple, Smartphone, Monitor } from "lucide-react";

const CONFIG = {
  ios: { label: "iOS", color: "#4F7CE8", Icon: Apple },
  android: { label: "Android", color: "#57B06B", Icon: Smartphone },
  desktop: { label: "Desktop", color: "#D3922F", Icon: Monitor },
};

export default function PlatformIcon({ platform, showLabel = true, className = "" }) {
  const cfg = CONFIG[platform] || CONFIG.desktop;
  const { Icon } = cfg;
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <Icon size={14} style={{ color: cfg.color }} strokeWidth={2.25} />
      {showLabel && <span className="text-sm font-medium">{cfg.label}</span>}
    </span>
  );
}

export { CONFIG as PLATFORM_CONFIG };
