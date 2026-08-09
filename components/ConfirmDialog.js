"use client";

import { AlertTriangle } from "lucide-react";

export default function ConfirmDialog({
  open,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  danger = true,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-ink-900/50 backdrop-blur-sm px-4"
      onClick={onCancel}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl bg-paper-100 shadow-lift p-6 animate-[pop-in_0.16s_ease-out]"
      >
        <div className={`h-10 w-10 rounded-full flex items-center justify-center mb-4 ${danger ? "bg-signal-50" : "bg-track-50"}`}>
          <AlertTriangle size={19} className={danger ? "text-signal-600" : "text-track-600"} />
        </div>
        <h2 id="confirm-title" className="font-display text-lg font-semibold text-ink-900">
          {title}
        </h2>
        <p className="text-sm text-ink-500 mt-1.5 leading-relaxed">{description}</p>
        <div className="flex gap-2.5 mt-6">
          <button
            onClick={onCancel}
            className="flex-1 rounded-lg border border-ink-200 py-2.5 text-sm font-medium text-ink-700 hover:bg-ink-50 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 rounded-lg py-2.5 text-sm font-medium text-white transition-colors ${
              danger ? "bg-signal-600 hover:bg-signal-700" : "bg-ink-900 hover:bg-ink-800"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
      <style jsx global>{`
        @keyframes pop-in {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
