import { Gauge, ChartNoAxesCombined, Newspaper, ShieldCheck } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import RouteDiagram from "@/components/RouteDiagram";

const STEPS = [
  {
    n: "Create",
    title: "Make a smart link",
    body: "Set one alias with separate destinations for iOS, Android, and desktop — the fallback covers everything else.",
  },
  {
    n: "Visit",
    title: "A visitor taps it",
    body: "Routely reads the incoming request's User-Agent to work out which platform they're on.",
  },
  {
    n: "Route",
    title: "Instant redirect",
    body: "A 302 sends them straight to the right App Store, Play Store, or web page — while the click is logged in the background.",
  },
];

const FEATURES = [
  {
    icon: Gauge,
    title: "Redirects that don't wait",
    body: "Analytics are written asynchronously after the redirect fires, so tracking never adds latency to the visitor's experience.",
    color: "#FF5A36",
  },
  {
    icon: ChartNoAxesCombined,
    title: "Real-time analytics",
    body: "Every click is logged with timestamp, platform, referrer, and country — broken down per link with time-series charts.",
    color: "#4F7CE8",
  },
  {
    icon: Newspaper,
    title: "Built-in blog CMS",
    body: "Draft and publish posts in Markdown with a live preview, then they appear instantly on a clean public blog.",
    color: "#57B06B",
  },
  {
    icon: ShieldCheck,
    title: "Locked-down admin",
    body: "A single authenticated console handles link management, analytics, and content — everything else stays read-only.",
    color: "#D3922F",
  },
];

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <section className="max-w-6xl mx-auto px-5 md:px-8 pt-16 md:pt-24 pb-10 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-block text-xs font-medium tracking-wide uppercase text-signal-600 bg-signal-50 px-3 py-1 rounded-full mb-5">
              Smart link router &amp; blog
            </span>
            <h1 className="font-display text-4xl md:text-5xl font-semibold text-ink-900 leading-[1.08] tracking-tight">
              One link. Every platform, its own path.
            </h1>
            <p className="text-ink-500 text-base md:text-lg mt-5 leading-relaxed max-w-md">
              Route App Store, Play Store, and web visitors from a single short link — with the click analytics and blog to go with it.
            </p>
            <div className="flex flex-wrap gap-3 mt-8">
              <a
                href="/admin"
                className="inline-flex items-center rounded-lg bg-ink-900 text-paper-100 px-5 py-3 text-sm font-medium hover:bg-ink-800 transition-colors"
              >
                Open admin console
              </a>
              <a
                href="/blog"
                className="inline-flex items-center rounded-lg border border-ink-200 px-5 py-3 text-sm font-medium text-ink-700 hover:bg-ink-50 transition-colors"
              >
                Read the blog
              </a>
            </div>
          </div>
          <RouteDiagram />
        </section>

        <section className="max-w-6xl mx-auto px-5 md:px-8 py-16 md:py-24 border-t border-ink-100">
          <h2 className="font-display text-2xl font-semibold text-ink-900 mb-2">How it works</h2>
          <p className="text-ink-500 mb-10 max-w-xl">Three steps from short link to the right store listing.</p>
          <div className="grid md:grid-cols-3 gap-8">
            {STEPS.map((s, i) => (
              <div key={s.n} className="relative">
                <div className="flex items-center gap-3 mb-3">
                  <span className="font-mono text-xs text-signal-600 bg-signal-50 h-7 w-7 rounded-full flex items-center justify-center">
                    {i + 1}
                  </span>
                  <span className="text-xs uppercase tracking-wider text-ink-400 font-medium">{s.n}</span>
                </div>
                <h3 className="font-display text-lg font-semibold text-ink-900 mb-2">{s.title}</h3>
                <p className="text-sm text-ink-500 leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-5 md:px-8 py-16 md:py-24 border-t border-ink-100">
          <h2 className="font-display text-2xl font-semibold text-ink-900 mb-10">Everything in one console</h2>
          <div className="grid sm:grid-cols-2 gap-5">
            {FEATURES.map(({ icon: Icon, title, body, color }) => (
              <div key={title} className="rounded-2xl border border-ink-100 bg-paper-100 p-6 shadow-panel">
                <span className="h-9 w-9 rounded-lg flex items-center justify-center mb-4" style={{ background: `${color}1A` }}>
                  <Icon size={17} style={{ color }} />
                </span>
                <h3 className="font-display font-semibold text-ink-900 mb-1.5">{title}</h3>
                <p className="text-sm text-ink-500 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
