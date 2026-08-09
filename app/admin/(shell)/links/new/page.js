"use client";

import { useRouter } from "next/navigation";
import NextLink from "next/link";
import { ArrowLeft } from "lucide-react";
import LinkForm from "@/components/LinkForm";
import { useToast } from "@/components/Toast";

export default function NewLinkPage() {
  const router = useRouter();
  const toast = useToast();

  async function handleSubmit(form) {
    const res = await fetch("/api/links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      if (data.errors) return { errors: data.errors };
      toast.error(data.error || "Failed to create link.");
      return {};
    }
    toast.success("Link created.");
    router.push("/admin/links");
    return {};
  }

  return (
    <div>
      <NextLink href="/admin/links" className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-900 mb-4 transition-colors">
        <ArrowLeft size={14} /> Back to links
      </NextLink>
      <h1 className="font-display text-2xl font-semibold text-ink-900 mb-1">New link</h1>
      <p className="text-sm text-ink-500 mb-7">Set a destination for each platform. Only the fallback is required.</p>
      <LinkForm onSubmit={handleSubmit} submitLabel="Create link" />
    </div>
  );
}
