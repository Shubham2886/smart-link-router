import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Link from "@/lib/models/Link";
import ClickEvent from "@/lib/models/ClickEvent";

export const dynamic = "force-dynamic";

export async function GET(req, { params }) {
  try {
    await connectDB();
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "Invalid link id." }, { status: 400 });
    }

    const link = await Link.findById(params.id).lean();
    if (!link) return NextResponse.json({ error: "Link not found." }, { status: 404 });

    const { searchParams } = new URL(req.url);
    const days = Math.min(parseInt(searchParams.get("days") || "14", 10) || 14, 90);
    const since = new Date();
    since.setDate(since.getDate() - (days - 1));
    since.setHours(0, 0, 0, 0);

    const linkObjectId = new mongoose.Types.ObjectId(params.id);

    const [platformAgg, dailyAgg, recentEvents, totalClicks, referrerAgg, countryAgg] =
      await Promise.all([
        ClickEvent.aggregate([
          { $match: { link: linkObjectId } },
          { $group: { _id: "$platform", count: { $sum: 1 } } },
        ]),
        ClickEvent.aggregate([
          { $match: { link: linkObjectId, createdAt: { $gte: since } } },
          {
            $group: {
              _id: {
                $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
              },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ]),
        ClickEvent.find({ link: linkObjectId }).sort({ createdAt: -1 }).limit(25).lean(),
        ClickEvent.countDocuments({ link: linkObjectId }),
        ClickEvent.aggregate([
          { $match: { link: linkObjectId } },
          { $group: { _id: "$referrer", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 6 },
        ]),
        ClickEvent.aggregate([
          { $match: { link: linkObjectId } },
          { $group: { _id: "$country", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 6 },
        ]),
      ]);

    const platformCounts = { ios: 0, android: 0, desktop: 0 };
    platformAgg.forEach((p) => {
      if (p._id in platformCounts) platformCounts[p._id] = p.count;
    });

    // Fill in every day in range, even days with zero clicks, so the chart has no gaps.
    const dailyMap = new Map(dailyAgg.map((d) => [d._id, d.count]));
    const series = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(since);
      d.setDate(since.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      series.push({ date: key, count: dailyMap.get(key) || 0 });
    }

    return NextResponse.json({
      link: { id: link._id, alias: link.alias, title: link.title },
      totalClicks,
      platformCounts,
      series,
      recentEvents,
      topReferrers: referrerAgg.map((r) => ({ referrer: r._id || "direct", count: r.count })),
      topCountries: countryAgg.map((c) => ({ country: c._id || "Unknown", count: c.count })),
    });
  } catch (err) {
    console.error("GET /api/links/[id]/analytics error:", err);
    return NextResponse.json({ error: "Failed to load analytics." }, { status: 500 });
  }
}
