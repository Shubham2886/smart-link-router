"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import NextLink from "next/link";
import { ArrowLeft } from "lucide-react";
import BlogForm from "@/components/BlogForm";
import { useToast } from "@/components/Toast";

export default function EditBlogPostPage() {
  const { id } = useParams();
  const router = useRouter();
  const toast = useToast();
  const [post, setPost] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/blog/${id}`)
      .then((r) => {
        if (r.status === 404) {
          setNotFound(true);
          return null;
        }
        return r.json();
      })
      .then((data) => data && setPost(data.post))
      .catch(() => toast.error("Could not load post."));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleSubmit(form) {
    const res = await fetch(`/api/blog/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      if (data.errors) return { errors: data.errors };
      toast.error(data.error || "Failed to update post.");
      return {};
    }
    toast.success(form.status === "published" ? "Post published." : "Draft saved.");
    router.push("/admin/blog");
    return {};
  }

  if (notFound) {
    return (
      <div className="text-center py-20">
        <p className="text-ink-500 mb-4">This post doesn&apos;t exist anymore.</p>
        <NextLink href="/admin/blog" className="text-signal-600 hover:underline text-sm">
          Back to blog
        </NextLink>
      </div>
    );
  }

  return (
    <div>
      <NextLink href="/admin/blog" className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-900 mb-4 transition-colors">
        <ArrowLeft size={14} /> Back to blog
      </NextLink>
      <h1 className="font-display text-2xl font-semibold text-ink-900 mb-1">{post ? "Edit post" : "Loading…"}</h1>
      <p className="text-sm text-ink-500 mb-7">Update content, then save as draft or publish.</p>
      {post && <BlogForm initial={post} onSubmit={handleSubmit} submitLabel="Save changes" />}
    </div>
  );
}
