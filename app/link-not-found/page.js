import NextLink from "next/link";
import { Unlink } from "lucide-react";
import Logo from "@/components/Logo";

export const metadata = { title: "Link not found — Routely" };

export default function LinkNotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-paper px-6 text-center">
      <NextLink href="/" className="mb-10">
        <Logo withWordmark />
      </NextLink>
      <span className="h-14 w-14 rounded-2xl bg-signal-50 flex items-center justify-center mb-6">
        <Unlink size={24} className="text-signal-600" />
      </span>
      <h1 className="font-display text-2xl font-semibold text-ink-900 mb-2">This link doesn&apos;t go anywhere</h1>
      <p className="text-ink-500 max-w-sm mb-8">
        The short link you followed doesn&apos;t exist, or has been paused by its owner.
      </p>
      <NextLink href="/" className="inline-flex items-center rounded-lg bg-ink-900 text-paper-100 px-5 py-2.5 text-sm font-medium hover:bg-ink-800 transition-colors">
        Go to homepage
      </NextLink>
    </div>
  );
}
