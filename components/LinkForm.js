"use client";

import { useState } from "react";
import { Apple, Smartphone, Monitor, Loader2 } from "lucide-react";

const FIELD_META = [
  { key: "iosUrl", label: "iOS destination", placeholder: "https://apps.apple.com/app/…", icon: Apple, color: "#4F7CE8", optional: true },
  { key: "androidUrl", label: "Android destination", placeholder: "https://play.google.com/store/apps/…", icon: Smartphone, color: "#57B06B", optional: true },
  { key: "fallbackUrl", label: "Fallback / desktop destination", placeholder: "https://example.com", icon: Monitor, color: "#D3922F", optional: false },
];

export default function LinkForm({ initial, onSubmit, submitLabel = "Create link" }) {
  const [form, setForm] = useState({
    alias: initial?.alias || "",
    title: initial?.title || "",
    iosUrl: initial?.iosUrl || "",
    androidUrl: initial?.androidUrl || "",
    fallbackUrl: initial?.fallbackUrl || "",
    active: initial?.active ?? true,
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});
    const result = await onSubmit(form);
    if (result?.errors) setErrors(result.errors);
    setSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-ink-600 mb-1.5">Title</label>
          <input
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            placeholder="Download our app"
            className={`w-full rounded-lg border bg-paper-100 px-3.5 py-2.5 text-sm outline-none transition-colors ${
              errors.title ? "border-signal-500" : "border-ink-200 focus:border-signal-500"
            }`}
          />
          {errors.title && <p className="text-xs text-signal-600 mt-1">{errors.title}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-ink-600 mb-1.5">Alias</label>
          <div className="flex items-center rounded-lg border border-ink-200 bg-paper-100 focus-within:border-signal-500 transition-colors overflow-hidden">
            <span className="pl-3.5 pr-1 text-sm text-ink-400 font-mono select-none">/l/</span>
            <input
              value={form.alias}
              onChange={(e) => update("alias", e.target.value.toLowerCase())}
              placeholder="my-app"
              className={`w-full bg-transparent py-2.5 pr-3.5 text-sm font-mono outline-none ${errors.alias ? "text-signal-600" : ""}`}
            />
          </div>
          {errors.alias && <p className="text-xs text-signal-600 mt-1">{errors.alias}</p>}
        </div>
      </div>

      <div className="space-y-4">
        {FIELD_META.map(({ key, label, placeholder, icon: Icon, color, optional }) => (
          <div key={key}>
            <label className="flex items-center gap-1.5 text-xs font-medium text-ink-600 mb-1.5">
              <Icon size={13} style={{ color }} />
              {label} {optional && <span className="text-ink-400 font-normal">(optional — falls back if empty)</span>}
            </label>
            <input
              value={form[key]}
              onChange={(e) => update(key, e.target.value)}
              placeholder={placeholder}
              className={`w-full rounded-lg border bg-paper-100 px-3.5 py-2.5 text-sm font-mono outline-none transition-colors ${
                errors[key] ? "border-signal-500" : "border-ink-200 focus:border-signal-500"
              }`}
            />
            {errors[key] && <p className="text-xs text-signal-600 mt-1">{errors[key]}</p>}
          </div>
        ))}
      </div>

      <label className="flex items-center gap-2.5 cursor-pointer w-fit">
        <span
          onClick={() => update("active", !form.active)}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${form.active ? "bg-track-500" : "bg-ink-200"}`}
        >
          <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${form.active ? "translate-x-4.5 ml-1" : "translate-x-1"}`} />
        </span>
        <span className="text-sm text-ink-700">Active — start routing visitors immediately</span>
      </label>

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex items-center gap-2 rounded-lg bg-ink-900 text-paper-100 px-5 py-2.5 text-sm font-medium hover:bg-ink-800 transition-colors disabled:opacity-60"
      >
        {submitting && <Loader2 size={15} className="animate-spin" />}
        {submitting ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
