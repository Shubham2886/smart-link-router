export default function StatCard({ label, value, icon: Icon, accent = "#FF5A36", suffix = "" }) {
  return (
    <div className="rounded-2xl border border-ink-100 bg-paper-100 p-5 shadow-panel relative overflow-hidden">
      <div
        className="absolute top-0 left-0 h-1 w-full"
        style={{ background: accent }}
      />
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium uppercase tracking-wider text-ink-400">{label}</span>
        {Icon && (
          <span
            className="h-7 w-7 rounded-lg flex items-center justify-center"
            style={{ background: `${accent}1A` }}
          >
            <Icon size={14} style={{ color: accent }} />
          </span>
        )}
      </div>
      <p className="font-mono text-2xl font-medium text-ink-900 tabular-nums">
        {value}
        {suffix && <span className="text-sm text-ink-400 ml-1">{suffix}</span>}
      </p>
    </div>
  );
}
