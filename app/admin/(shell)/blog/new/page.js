"use client";

import { useRouter } from "next/navigation";
import NextLink from "next/link";
import { ArrowLeft } from "lucide-react";
import BlogForm from "@/components/BlogForm";
import { useToast } from "@/components/Toast";

export default function NewBlogPostPage() {
  const router = useRouter();
  const toast = useToast();

  async function handleSubmit(form) {
    const res = await fetch("/api/blog", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      if (data.errors) return { errors: data.errors };
      toast.error(data.error || "Failed to create post.");
      return {};
    }
    toast.success(form.status === "published" ? "Post published." : "Draft saved.");
    router.push("/admin/blog");
    return {};
  }

  return (
    <div>
      <NextLink href="/admin/blog" className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-900 mb-4 transition-colors">
        <ArrowLeft size={14} /> Back to blog
      </NextLink>
      <h1 className="font-display text-2xl font-semibold text-ink-900 mb-1">New post</h1>
      <p className="text-sm text-ink-500 mb-7">Write in Markdown — the preview on the right updates as you type.</p>
      <BlogForm onSubmit={handleSubmit} />
    </div>
  );
}
