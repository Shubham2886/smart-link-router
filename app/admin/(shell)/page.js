"use client";

import { useEffect, useState } from "react";
import NextLink from "next/link";
import { Link2, Newspaper, MousePointerClick, Activity, ArrowUpRight } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import StatCard from "@/components/StatCard";
import PlatformIcon from "@/components/PlatformIcon";
import { SkeletonCard, SkeletonLine } from "@/components/Skeleton";

function formatDay(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString(undefined, { weekday: "short" });
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setStats(data);
      })
      .catch(() => setError("Could not load dashboard data."));
  }, []);

  const totalPlatformClicks = stats
    ? stats.platformCounts.ios + stats.platformCounts.android + stats.platformCounts.desktop
    : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h1 className="font-display text-2xl font-semibold text-ink-900">Dashboard</h1>
      </div>
      <p className="text-sm text-ink-500 mb-7">
        A quick look at how your links and posts are performing.
      </p>

      {error && (
        <p className="text-sm text-signal-600 bg-signal-50 rounded-lg px-4 py-3 mb-6">{error}</p>
      )}

      {!stats && !error ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : stats ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total links" value={stats.totals.totalLinks} icon={Link2} accent="#FF5A36" />
            <StatCard label="Active links" value={stats.totals.activeLinks} icon={Activity} accent="#2F6F5E" />
            <StatCard label="Total clicks" value={stats.totals.totalClicks} icon={MousePointerClick} accent="#4F7CE8" />
            <StatCard label="Published posts" value={`${stats.totals.publishedPosts} / ${stats.totals.totalPosts}`} icon={Newspaper} accent="#D3922F" />
          </div>

          <div className="grid lg:grid-cols-3 gap-4 mt-4">
            <div className="lg:col-span-2 rounded-2xl border border-ink-100 bg-paper-100 p-5 shadow-panel">
              <h2 className="font-display text-sm font-semibold text-ink-900 mb-4">
                Clicks, last 7 days
              </h2>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.series} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="clickFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#FF5A36" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#FF5A36" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} stroke="#14161B" strokeOpacity={0.06} />
                    <XAxis
                      dataKey="date"
                      tickFormatter={formatDay}
                      tick={{ fontSize: 11, fill: "#6E7481" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis tick={{ fontSize: 11, fill: "#6E7481" }} axisLine={false} tickLine={false} allowDecimals={false} width={30} />
                    <Tooltip
                      labelFormatter={(v) => new Date(v + "T00:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                      contentStyle={{ borderRadius: 10, border: "1px solid #E4E6E9", fontSize: 12 }}
                    />
                    <Area type="monotone" dataKey="count" stroke="#FF5A36" strokeWidth={2} fill="url(#clickFill)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-2xl border border-ink-100 bg-paper-100 p-5 shadow-panel">
              <h2 className="font-display text-sm font-semibold text-ink-900 mb-4">Platform split</h2>
              <div className="space-y-3.5">
                {["ios", "android", "desktop"].map((p) => {
                  const count = stats.platformCounts[p];
                  const pct = totalPlatformClicks ? Math.round((count / totalPlatformClicks) * 100) : 0;
                  return (
                    <div key={p}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <PlatformIcon platform={p} />
                        <span className="font-mono text-ink-500">{count} · {pct}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-ink-100 overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${pct}%`,
                            background: p === "ios" ? "#4F7CE8" : p === "android" ? "#57B06B" : "#D3922F",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
                {totalPlatformClicks === 0 && (
                  <p className="text-xs text-ink-400 pt-2">No clicks logged yet.</p>
                )}
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-4 mt-4">
            <div className="rounded-2xl border border-ink-100 bg-paper-100 shadow-panel overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-ink-100">
                <h2 className="font-display text-sm font-semibold text-ink-900">Top links</h2>
                <NextLink href="/admin/links" className="text-xs text-signal-600 hover:underline inline-flex items-center gap-0.5">
                  View all <ArrowUpRight size={12} />
                </NextLink>
              </div>
              {stats.topLinks.length === 0 ? (
                <p className="text-sm text-ink-400 px-5 py-6">Create your first link to see it here.</p>
              ) : (
                <ul>
                  {stats.topLinks.map((l) => (
                    <li key={l._id} className="flex items-center justify-between px-5 py-3 border-b border-ink-100 last:border-0">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-ink-900 truncate">{l.title}</p>
                        <p className="text-xs font-mono text-ink-400">/l/{l.alias}</p>
                      </div>
                      <span className="font-mono text-sm text-ink-700 shrink-0 ml-3">{l.clickCount}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="rounded-2xl border border-ink-100 bg-paper-100 shadow-panel overflow-hidden">
              <div className="px-5 py-4 border-b border-ink-100">
                <h2 className="font-display text-sm font-semibold text-ink-900">Recent activity</h2>
              </div>
              {stats.recentEvents.length === 0 ? (
                <p className="text-sm text-ink-400 px-5 py-6">Clicks will show up here in real time.</p>
              ) : (
                <ul>
                  {stats.recentEvents.map((ev) => (
                    <li key={ev._id} className="flex items-center justify-between px-5 py-3 border-b border-ink-100 last:border-0">
                      <div className="min-w-0">
                        <p className="text-sm text-ink-900 truncate">{ev.link?.title || ev.alias}</p>
                        <p className="text-xs text-ink-400">{new Date(ev.createdAt).toLocaleString()}</p>
                      </div>
                      <PlatformIcon platform={ev.platform} showLabel={false} />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
