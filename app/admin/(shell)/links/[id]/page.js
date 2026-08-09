"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import NextLink from "next/link";
import { ArrowLeft, MousePointerClick } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import LinkForm from "@/components/LinkForm";
import PlatformIcon from "@/components/PlatformIcon";
import StatCard from "@/components/StatCard";
import { SkeletonCard } from "@/components/Skeleton";
import { useToast } from "@/components/Toast";

const PLATFORM_COLORS = { ios: "#4F7CE8", android: "#57B06B", desktop: "#D3922F" };

export default function EditLinkPage() {
  const { id } = useParams();
  const router = useRouter();
  const toast = useToast();

  const [link, setLink] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/links/${id}`)
      .then((r) => {
        if (r.status === 404) {
          setNotFound(true);
          return null;
        }
        return r.json();
      })
      .then((data) => data && setLink(data.link))
      .catch(() => toast.error("Could not load link."));

    fetch(`/api/links/${id}/analytics`)
      .then((r) => r.json())
      .then((data) => !data.error && setAnalytics(data))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleSubmit(form) {
    const res = await fetch(`/api/links/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      if (data.errors) return { errors: data.errors };
      toast.error(data.error || "Failed to update link.");
      return {};
    }
    toast.success("Link updated.");
    setLink(data.link);
    return {};
  }

  if (notFound) {
    return (
      <div className="text-center py-20">
        <p className="text-ink-500 mb-4">This link doesn&apos;t exist anymore.</p>
        <NextLink href="/admin/links" className="text-signal-600 hover:underline text-sm">
          Back to links
        </NextLink>
      </div>
    );
  }

  const pieData = analytics
    ? ["ios", "android", "desktop"]
        .map((k) => ({ name: k, value: analytics.platformCounts[k] }))
        .filter((d) => d.value > 0)
    : [];

  return (
    <div>
      <NextLink href="/admin/links" className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-900 mb-4 transition-colors">
        <ArrowLeft size={14} /> Back to links
      </NextLink>

      <h1 className="font-display text-2xl font-semibold text-ink-900 mb-1">
        {link ? link.title : "Loading…"}
      </h1>
      <p className="text-sm text-ink-500 mb-8 font-mono">{link ? `/l/${link.alias}` : ""}</p>

      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2">
          <h2 className="font-display text-sm font-semibold text-ink-900 mb-4">Edit details</h2>
          {link ? (
            <LinkForm initial={link} onSubmit={handleSubmit} submitLabel="Save changes" />
          ) : (
            <div className="space-y-4">
              <SkeletonCard />
              <SkeletonCard />
            </div>
          )}
        </div>

        <div className="lg:col-span-3">
          <h2 className="font-display text-sm font-semibold text-ink-900 mb-4">Analytics</h2>
          {!analytics ? (
            <div className="grid grid-cols-2 gap-4">
              <SkeletonCard /><SkeletonCard />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <StatCard label="Total clicks" value={analytics.totalClicks} icon={MousePointerClick} accent="#FF5A36" />
                <div className="rounded-2xl border border-ink-100 bg-paper-100 p-5 shadow-panel">
                  <p className="text-xs font-medium uppercase tracking-wider text-ink-400 mb-3">Platform split</p>
                  {pieData.length === 0 ? (
                    <p className="text-xs text-ink-400 mt-2">No clicks yet.</p>
                  ) : (
                    <div className="h-16 flex items-center gap-3">
                      <ResponsiveContainer width={64} height={64}>
                        <PieChart>
                          <Pie data={pieData} dataKey="value" innerRadius={18} outerRadius={30} paddingAngle={2}>
                            {pieData.map((d) => (
                              <Cell key={d.name} fill={PLATFORM_COLORS[d.name]} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="space-y-1">
                        {pieData.map((d) => (
                          <div key={d.name} className="flex items-center gap-1.5 text-xs">
                            <PlatformIcon platform={d.name} showLabel={false} />
                            <span className="font-mono text-ink-600">{d.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-ink-100 bg-paper-100 p-5 shadow-panel mb-4">
                <p className="text-xs font-medium uppercase tracking-wider text-ink-400 mb-3">Clicks, last 14 days</p>
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.series} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                      <CartesianGrid vertical={false} stroke="#14161B" strokeOpacity={0.06} />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(v) => new Date(v + "T00:00:00").getDate()}
                        tick={{ fontSize: 10, fill: "#6E7481" }}
                        axisLine={false}
                        tickLine={false}
                        interval={1}
                      />
                      <YAxis tick={{ fontSize: 10, fill: "#6E7481" }} axisLine={false} tickLine={false} allowDecimals={false} width={26} />
                      <Tooltip
                        labelFormatter={(v) => new Date(v + "T00:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                        contentStyle={{ borderRadius: 10, border: "1px solid #E4E6E9", fontSize: 12 }}
                      />
                      <Bar dataKey="count" fill="#FF5A36" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-2xl border border-ink-100 bg-paper-100 shadow-panel overflow-hidden">
                <p className="text-xs font-medium uppercase tracking-wider text-ink-400 px-5 pt-4 pb-3">Recent clicks</p>
                {analytics.recentEvents.length === 0 ? (
                  <p className="text-sm text-ink-400 px-5 pb-5">No clicks logged yet.</p>
                ) : (
                  <ul className="max-h-80 overflow-y-auto">
                    {analytics.recentEvents.map((ev) => (
                      <li key={ev._id} className="flex items-center justify-between px-5 py-2.5 border-t border-ink-100 text-sm">
                        <span className="text-ink-500 text-xs">{new Date(ev.createdAt).toLocaleString()}</span>
                        <span className="text-ink-400 text-xs truncate max-w-[35%]">{ev.country}</span>
                        <PlatformIcon platform={ev.platform} showLabel={false} />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
