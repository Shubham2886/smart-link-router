import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import BlogPost from "@/lib/models/BlogPost";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const page = Math.max(parseInt(searchParams.get("page") || "1", 10) || 1, 1);
    const limit = Math.min(parseInt(searchParams.get("limit") || "9", 10) || 9, 24);

    const filter = { status: "published" };
    const [posts, total] = await Promise.all([
      BlogPost.find(filter)
        .select("title slug excerpt featuredImage author publishedAt createdAt")
        .sort({ publishedAt: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      BlogPost.countDocuments(filter),
    ]);

    return NextResponse.json({
      posts,
      pagination: { page, limit, total, pages: Math.max(Math.ceil(total / limit), 1) },
    });
  } catch (err) {
    console.error("GET /api/public/blog error:", err);
    return NextResponse.json({ error: "Failed to load posts." }, { status: 500 });
  }
}
