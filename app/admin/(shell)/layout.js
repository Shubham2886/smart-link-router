"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import NextLink from "next/link";
import { LayoutDashboard, Link2, Newspaper, LogOut, ExternalLink, Menu, X } from "lucide-react";
import Logo from "@/components/Logo";
import { ToastProvider } from "@/components/Toast";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/links", label: "Links", icon: Link2 },
  { href: "/admin/blog", label: "Blog", icon: Newspaper },
];

function SidebarContent({ pathname, email, onLogout }) {
  return (
    <div className="flex flex-col h-full">
      <div className="px-5 py-6">
        <Logo className="h-7 w-7" withWordmark dark />
      </div>
      <nav className="flex-1 px-3 space-y-1">
        {NAV.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <NextLink
              key={href}
              href={href}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-ink-800 text-paper-100"
                  : "text-ink-300 hover:bg-ink-800/60 hover:text-paper-100"
              }`}
            >
              <Icon size={16} />
              {label}
            </NextLink>
          );
        })}
      </nav>
      <div className="px-3 pb-5 space-y-1 border-t border-ink-800 pt-4 mt-4">
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-ink-300 hover:bg-ink-800/60 hover:text-paper-100 transition-colors"
        >
          <ExternalLink size={15} />
          View site
        </a>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-ink-300 hover:bg-signal-600/20 hover:text-signal-400 transition-colors"
        >
          <LogOut size={15} />
          Log out
        </button>
        {email && <p className="px-3 pt-2 text-[11px] text-ink-500 truncate">{email}</p>}
      </div>
    </div>
  );
}

export default function AdminShellLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [checking, setChecking] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (!data.authenticated) {
          router.replace(`/admin/login?from=${encodeURIComponent(pathname)}`);
        } else {
          setEmail(data.email);
          setChecking(false);
        }
      })
      .catch(() => setChecking(false));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <div className="flex items-center gap-2 text-ink-400 text-sm">
          <span className="h-2 w-2 rounded-full bg-signal-500 animate-pulse" />
          Checking session…
        </div>
      </div>
    );
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-paper flex">
        {/* Desktop sidebar */}
        <aside className="hidden md:flex md:w-60 md:flex-col bg-ink-900 shrink-0">
          <SidebarContent pathname={pathname} email={email} onLogout={handleLogout} />
        </aside>

        {/* Mobile top bar + drawer */}
        <div className="md:hidden fixed top-0 inset-x-0 z-40 flex items-center justify-between px-4 py-3 bg-ink-900">
          <Logo className="h-6 w-6" withWordmark dark />
          <button onClick={() => setMobileOpen(true)} aria-label="Open menu" className="text-paper-100">
            <Menu size={22} />
          </button>
        </div>
        {mobileOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-ink-900/95" onClick={() => setMobileOpen(false)}>
            <div className="flex justify-end px-4 py-3">
              <button onClick={() => setMobileOpen(false)} aria-label="Close menu" className="text-paper-100">
                <X size={22} />
              </button>
            </div>
            <div onClick={(e) => e.stopPropagation()}>
              <SidebarContent
                pathname={pathname}
                email={email}
                onLogout={handleLogout}
              />
            </div>
          </div>
        )}

        <main className="flex-1 min-w-0 pt-14 md:pt-0">
          <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">{children}</div>
        </main>
      </div>
    </ToastProvider>
  );
}
