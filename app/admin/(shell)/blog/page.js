"use client";

import { useEffect, useState, useCallback } from "react";
import NextLink from "next/link";
import { Plus, Pencil, Trash2, ExternalLink } from "lucide-react";
import ConfirmDialog from "@/components/ConfirmDialog";
import { SkeletonTable } from "@/components/Skeleton";
import { useToast } from "@/components/Toast";

const FILTERS = [
  { key: "", label: "All" },
  { key: "published", label: "Published" },
  { key: "draft", label: "Drafts" },
];

export default function AdminBlogPage() {
  const toast = useToast();
  const [posts, setPosts] = useState(null);
  const [filter, setFilter] = useState("");
  const [pendingDelete, setPendingDelete] = useState(null);

  const load = useCallback((status = "") => {
    const url = status ? `/api/blog?status=${status}` : "/api/blog";
    fetch(url)
      .then((r) => r.json())
      .then((data) => setPosts(data.posts || []))
      .catch(() => toast.error("Could not load posts."));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    load(filter);
  }, [filter, load]);

  async function confirmDelete() {
    const post = pendingDelete;
    setPendingDelete(null);
    try {
      const res = await fetch(`/api/blog/${post._id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setPosts((prev) => prev.filter((p) => p._id !== post._id));
      toast.success("Post deleted.");
    } catch (err) {
      toast.error(err.message);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-1">
        <h1 className="font-display text-2xl font-semibold text-ink-900">Blog</h1>
        <NextLink
          href="/admin/blog/new"
          className="inline-flex items-center gap-1.5 rounded-lg bg-ink-900 text-paper-100 px-4 py-2.5 text-sm font-medium hover:bg-ink-800 transition-colors shrink-0"
        >
          <Plus size={16} /> New post
        </NextLink>
      </div>
      <p className="text-sm text-ink-500 mb-6">Write and publish posts to your public blog.</p>

      <div className="flex gap-1.5 mb-5">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
              filter === f.key ? "bg-ink-900 text-paper-100" : "bg-paper-100 text-ink-500 border border-ink-200 hover:bg-ink-50"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {posts === null ? (
        <SkeletonTable rows={4} />
      ) : posts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink-200 bg-paper-100 p-12 text-center">
          <p className="text-sm text-ink-500 mb-4">No posts here yet.</p>
          <NextLink
            href="/admin/blog/new"
            className="inline-flex items-center gap-1.5 rounded-lg bg-ink-900 text-paper-100 px-4 py-2.5 text-sm font-medium hover:bg-ink-800 transition-colors"
          >
            <Plus size={16} /> New post
          </NextLink>
        </div>
      ) : (
        <div className="rounded-2xl border border-ink-100 bg-paper-100 shadow-panel overflow-hidden overflow-x-auto">
          <table className="w-full text-sm min-w-[560px]">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-ink-400 border-b border-ink-100">
                <th className="px-5 py-3 font-medium">Post</th>
                <th className="px-5 py-3 font-medium">Author</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Updated</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post._id} className="border-b border-ink-100 last:border-0 hover:bg-paper-200/60 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-medium text-ink-900">{post.title}</p>
                    <p className="font-mono text-xs text-ink-400">/blog/{post.slug}</p>
                  </td>
                  <td className="px-5 py-4 text-ink-600">{post.author}</td>
                  <td className="px-5 py-4">
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                        post.status === "published" ? "bg-track-50 text-track-600" : "bg-ink-100 text-ink-500"
                      }`}
                    >
                      {post.status === "published" ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-ink-500 text-xs">{new Date(post.updatedAt).toLocaleDateString()}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1">
                      {post.status === "published" && (
                        <a
                          href={`/blog/${post.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          title="View live"
                          className="p-2 rounded-lg text-ink-500 hover:bg-ink-100 transition-colors"
                        >
                          <ExternalLink size={15} />
                        </a>
                      )}
                      <NextLink
                        href={`/admin/blog/${post._id}`}
                        title="Edit post"
                        className="p-2 rounded-lg text-ink-500 hover:bg-ink-100 transition-colors"
                      >
                        <Pencil size={15} />
                      </NextLink>
                      <button
                        onClick={() => setPendingDelete(post)}
                        title="Delete post"
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
        title="Delete this post?"
        description={pendingDelete ? `"${pendingDelete.title}" will be permanently removed.` : ""}
        confirmLabel="Delete post"
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
