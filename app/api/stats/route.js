import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Link from "@/lib/models/Link";
import BlogPost from "@/lib/models/BlogPost";
import ClickEvent from "@/lib/models/ClickEvent";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectDB();

    const since7 = new Date();
    since7.setDate(since7.getDate() - 6);
    since7.setHours(0, 0, 0, 0);

    const [
      totalLinks,
      activeLinks,
      totalPosts,
      publishedPosts,
      totalClicks,
      clicksLast7,
      topLinks,
      platformSplit,
      recentEvents,
    ] = await Promise.all([
      Link.countDocuments(),
      Link.countDocuments({ active: true }),
      BlogPost.countDocuments(),
      BlogPost.countDocuments({ status: "published" }),
      ClickEvent.countDocuments(),
      ClickEvent.aggregate([
        { $match: { createdAt: { $gte: since7 } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Link.find().sort({ clickCount: -1 }).limit(5).select("alias title clickCount active").lean(),
      ClickEvent.aggregate([{ $group: { _id: "$platform", count: { $sum: 1 } } }]),
      ClickEvent.find().sort({ createdAt: -1 }).limit(8).populate("link", "alias title").lean(),
    ]);

    const dailyMap = new Map(clicksLast7.map((d) => [d._id, d.count]));
    const series = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(since7);
      d.setDate(since7.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      series.push({ date: key, count: dailyMap.get(key) || 0 });
    }

    const platformCounts = { ios: 0, android: 0, desktop: 0 };
    platformSplit.forEach((p) => {
      if (p._id in platformCounts) platformCounts[p._id] = p.count;
    });

    return NextResponse.json({
      totals: { totalLinks, activeLinks, totalPosts, publishedPosts, totalClicks },
      series,
      topLinks,
      platformCounts,
      recentEvents,
    });
  } catch (err) {
    console.error("GET /api/stats error:", err);
    return NextResponse.json({ error: "Failed to load dashboard stats." }, { status: 500 });
  }
}
