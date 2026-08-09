import NextLink from "next/link";
import Logo from "@/components/Logo";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-30 bg-paper/85 backdrop-blur-md border-b border-ink-100">
      <div className="max-w-6xl mx-auto px-5 md:px-8 h-16 flex items-center justify-between">
        <NextLink href="/">
          <Logo withWordmark />
        </NextLink>
        <nav className="flex items-center gap-6">
          <NextLink href="/blog" className="text-sm font-medium text-ink-600 hover:text-ink-900 transition-colors">
            Blog
          </NextLink>
          <NextLink
            href="/admin"
            className="text-sm font-medium bg-ink-900 text-paper-100 px-4 py-2 rounded-lg hover:bg-ink-800 transition-colors"
          >
            Admin
          </NextLink>
        </nav>
      </div>
    </header>
  );
}
