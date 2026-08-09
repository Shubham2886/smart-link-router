"use client";

import { useEffect, useState, useCallback } from "react";
import NextLink from "next/link";
import { Plus, Copy, Pencil, Trash2, Search, Check, ExternalLink } from "lucide-react";
import PlatformIcon from "@/components/PlatformIcon";
import ConfirmDialog from "@/components/ConfirmDialog";
import { SkeletonTable } from "@/components/Skeleton";
import { useToast } from "@/components/Toast";

export default function AdminLinksPage() {
  const toast = useToast();
  const [links, setLinks] = useState(null);
  const [query, setQuery] = useState("");
  const [copiedId, setCopiedId] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback((q = "") => {
    const url = q ? `/api/links?q=${encodeURIComponent(q)}` : "/api/links";
    fetch(url)
      .then((r) => r.json())
      .then((data) => setLinks(data.links || []))
      .catch(() => toast.error("Could not load links."));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const t = setTimeout(() => load(query), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  function shortUrl(alias) {
    if (typeof window === "undefined") return `/l/${alias}`;
    return `${window.location.origin}/l/${alias}`;
  }

  async function copyLink(link) {
    try {
      await navigator.clipboard.writeText(shortUrl(link.alias));
      setCopiedId(link._id);
      setTimeout(() => setCopiedId(null), 1600);
    } catch {
      toast.error("Couldn't copy — copy it manually instead.");
    }
  }

  async function toggleActive(link) {
    setBusyId(link._id);
    try {
      const res = await fetch(`/api/links/${link._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...link, active: !link.active }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      setLinks((prev) => prev.map((l) => (l._id === link._id ? data.link : l)));
      toast.success(`Link ${data.link.active ? "activated" : "paused"}.`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusyId(null);
    }
  }

  async function confirmDelete() {
    const link = pendingDelete;
    setPendingDelete(null);
    try {
      const res = await fetch(`/api/links/${link._id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setLinks((prev) => prev.filter((l) => l._id !== link._id));
      toast.success("Link deleted.");
    } catch (err) {
      toast.error(err.message);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-1">
        <h1 className="font-display text-2xl font-semibold text-ink-900">Links</h1>
        <NextLink
          href="/admin/links/new"
          className="inline-flex items-center gap-1.5 rounded-lg bg-ink-900 text-paper-100 px-4 py-2.5 text-sm font-medium hover:bg-ink-800 transition-colors shrink-0"
        >
          <Plus size={16} /> New link
        </NextLink>
      </div>
      <p className="text-sm text-ink-500 mb-6">
        Create smart short links that route iOS, Android, and desktop visitors to different destinations.
      </p>

      <div className="relative mb-5 max-w-sm">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by title or alias…"
          className="w-full rounded-lg border border-ink-200 bg-paper-100 pl-9 pr-3.5 py-2.5 text-sm outline-none focus:border-signal-500 transition-colors"
        />
      </div>

      {links === null ? (
        <SkeletonTable rows={4} />
      ) : links.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink-200 bg-paper-100 p-12 text-center">
          <p className="text-sm text-ink-500 mb-4">
            {query ? "No links match your search." : "No links yet — create your first smart link."}
          </p>
          {!query && (
            <NextLink
              href="/admin/links/new"
              className="inline-flex items-center gap-1.5 rounded-lg bg-ink-900 text-paper-100 px-4 py-2.5 text-sm font-medium hover:bg-ink-800 transition-colors"
            >
              <Plus size={16} /> New link
            </NextLink>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-ink-100 bg-paper-100 shadow-panel overflow-hidden overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-ink-400 border-b border-ink-100">
                <th className="px-5 py-3 font-medium">Link</th>
                <th className="px-5 py-3 font-medium">Routes</th>
                <th className="px-5 py-3 font-medium text-right">Clicks</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {links.map((link) => (
                <tr key={link._id} className="border-b border-ink-100 last:border-0 hover:bg-paper-200/60 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-medium text-ink-900">{link.title}</p>
                    <p className="font-mono text-xs text-ink-400">/l/{link.alias}</p>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <PlatformIcon platform="ios" showLabel={false} className={link.iosUrl ? "" : "opacity-25"} />
                      <PlatformIcon platform="android" showLabel={false} className={link.androidUrl ? "" : "opacity-25"} />
                      <PlatformIcon platform="desktop" showLabel={false} />
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right font-mono text-ink-700">{link.clickCount}</td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => toggleActive(link)}
                      disabled={busyId === link._id}
                      className={`text-xs font-medium px-2.5 py-1 rounded-full transition-colors ${
                        link.active ? "bg-track-50 text-track-600" : "bg-ink-100 text-ink-500"
                      }`}
                    >
                      {link.active ? "Active" : "Paused"}
                    </button>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => copyLink(link)}
                        title="Copy short URL"
                        className="p-2 rounded-lg text-ink-500 hover:bg-ink-100 transition-colors"
                      >
                        {copiedId === link._id ? <Check size={15} className="text-track-500" /> : <Copy size={15} />}
                      </button>
                      <a
                        href={`/l/${link.alias}`}
                        target="_blank"
                        rel="noreferrer"
                        title="Open short link"
                        className="p-2 rounded-lg text-ink-500 hover:bg-ink-100 transition-colors"
                      >
                        <ExternalLink size={15} />
                      </a>
                      <NextLink
                        href={`/admin/links/${link._id}`}
                        title="Edit & view analytics"
                        className="p-2 rounded-lg text-ink-500 hover:bg-ink-100 transition-colors"
                      >
                        <Pencil size={15} />
                      </NextLink>
                      <button
                        onClick={() => setPendingDelete(link)}
                        title="Delete link"
                        className="p-2 rounded-lg text-ink-500 hover:bg-signal-50 hover:text-signal-600 transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete this link?"
        description={pendingDelete ? `"${pendingDelete.title}" and all of its click history will be permanently removed.` : ""}
        confirmLabel="Delete link"
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
