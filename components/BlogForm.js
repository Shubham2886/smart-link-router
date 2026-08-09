"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Loader2, Eye, Pencil } from "lucide-react";

export default function BlogForm({ initial, onSubmit, submitLabel = "Save" }) {
  const [form, setForm] = useState({
    title: initial?.title || "",
    slug: initial?.slug || "",
    author: initial?.author || "",
    featuredImage: initial?.featuredImage || "",
    excerpt: initial?.excerpt || "",
    content: initial?.content || "",
    status: initial?.status || "draft",
  });
  const [slugTouched, setSlugTouched] = useState(!!initial?.slug);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [preview, setPreview] = useState(false);

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function handleTitleChange(value) {
    update("title", value);
    if (!slugTouched) {
      const auto = value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
      setForm((f) => ({ ...f, title: value, slug: auto }));
    }
  }

  async function submitAs(status) {
    setSubmitting(true);
    setErrors({});
    const payload = { ...form, status };
    const result = await onSubmit(payload);
    if (result?.errors) setErrors(result.errors);
    setSubmitting(false);
  }

  return (
    <div className="grid lg:grid-cols-5 gap-8">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submitAs(form.status === "published" ? "published" : "draft");
        }}
        className="lg:col-span-2 space-y-5"
      >
        <div>
          <label className="block text-xs font-medium text-ink-600 mb-1.5">Title</label>
          <input
            value={form.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="How smart links improve app installs"
            className={`w-full rounded-lg border bg-paper-100 px-3.5 py-2.5 text-sm outline-none transition-colors ${
              errors.title ? "border-signal-500" : "border-ink-200 focus:border-signal-500"
            }`}
          />
          {errors.title && <p className="text-xs text-signal-600 mt-1">{errors.title}</p>}
        </div>

        <div>
          <label className="block text-xs font-medium text-ink-600 mb-1.5">Slug</label>
          <div className="flex items-center rounded-lg border border-ink-200 bg-paper-100 focus-within:border-signal-500 transition-colors overflow-hidden">
            <span className="pl-3.5 pr-1 text-sm text-ink-400 font-mono select-none">/blog/</span>
            <input
              value={form.slug}
              onChange={(e) => {
                setSlugTouched(true);
                update("slug", e.target.value.toLowerCase());
              }}
              className="w-full bg-transparent py-2.5 pr-3.5 text-sm font-mono outline-none"
            />
          </div>
          {errors.slug && <p className="text-xs text-signal-600 mt-1">{errors.slug}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-ink-600 mb-1.5">Author</label>
            <input
              value={form.author}
              onChange={(e) => update("author", e.target.value)}
              placeholder="Admin"
              className="w-full rounded-lg border border-ink-200 bg-paper-100 px-3.5 py-2.5 text-sm outline-none focus:border-signal-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-600 mb-1.5">Featured image URL</label>
            <input
              value={form.featuredImage}
              onChange={(e) => update("featuredImage", e.target.value)}
              placeholder="https://…"
              className="w-full rounded-lg border border-ink-200 bg-paper-100 px-3.5 py-2.5 text-sm font-mono outline-none focus:border-signal-500 transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-ink-600 mb-1.5">
            Excerpt <span className="text-ink-400 font-normal">(shown on the blog listing card)</span>
          </label>
          <textarea
            value={form.excerpt}
            onChange={(e) => update("excerpt", e.target.value)}
            rows={2}
            placeholder="A short one or two sentence summary…"
            className="w-full rounded-lg border border-ink-200 bg-paper-100 px-3.5 py-2.5 text-sm outline-none focus:border-signal-500 transition-colors resize-none"
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="block text-xs font-medium text-ink-600">Content (Markdown)</label>
          <button
            type="button"
            onClick={() => setPreview((p) => !p)}
            className="inline-flex items-center gap-1 text-xs text-ink-500 hover:text-ink-900 transition-colors"
          >
            {preview ? <Pencil size={12} /> : <Eye size={12} />}
            {preview ? "Edit" : "Preview"}
          </button>
        </div>
        {preview ? (
          <div className="prose-blog border border-ink-200 rounded-lg px-4 py-3 min-h-[220px] bg-paper-100 text-sm">
            <ReactMarkdown>{form.content || "*Nothing to preview yet.*"}</ReactMarkdown>
          </div>
        ) : (
          <textarea
            value={form.content}
            onChange={(e) => update("content", e.target.value)}
            rows={12}
            placeholder="## Write your post in Markdown…"
            className={`w-full rounded-lg border bg-paper-100 px-3.5 py-2.5 text-sm font-mono outline-none transition-colors resize-y ${
              errors.content ? "border-signal-500" : "border-ink-200 focus:border-signal-500"
            }`}
          />
        )}
        {errors.content && <p className="text-xs text-signal-600 -mt-3">{errors.content}</p>}

        <div className="flex flex-wrap gap-2.5 pt-1">
          <button
            type="button"
            disabled={submitting}
            onClick={() => submitAs("draft")}
            className="inline-flex items-center gap-2 rounded-lg border border-ink-200 px-5 py-2.5 text-sm font-medium text-ink-700 hover:bg-ink-50 transition-colors disabled:opacity-60"
          >
            {submitting && <Loader2 size={15} className="animate-spin" />}
            Save as draft
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={() => submitAs("published")}
            className="inline-flex items-center gap-2 rounded-lg bg-ink-900 text-paper-100 px-5 py-2.5 text-sm font-medium hover:bg-ink-800 transition-colors disabled:opacity-60"
          >
            {submitting && <Loader2 size={15} className="animate-spin" />}
            Publish
          </button>
        </div>
      </form>

      <div className="lg:col-span-3">
        <p className="text-xs font-medium uppercase tracking-wider text-ink-400 mb-3">Live preview</p>
        <article className="rounded-2xl border border-ink-100 bg-paper-100 shadow-panel overflow-hidden">
          {form.featuredImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={form.featuredImage} alt="" className="w-full h-56 object-cover" onError={(e) => (e.target.style.display = "none")} />
          )}
          <div className="p-7">
            <p className="text-xs text-ink-400 mb-2">{form.author || "Admin"} · {form.status === "published" ? "Published" : "Draft"}</p>
            <h1 className="font-display text-2xl font-semibold text-ink-900 mb-4">{form.title || "Untitled post"}</h1>
            <div className="prose-blog text-sm">
              <ReactMarkdown>{form.content || "*Start writing to see a preview…*"}</ReactMarkdown>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
