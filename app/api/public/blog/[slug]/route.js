import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import BlogPost from "@/lib/models/BlogPost";

export const dynamic = "force-dynamic";

export async function GET(_req, { params }) {
  try {
    await connectDB();
    const post = await BlogPost.findOne({ slug: params.slug, status: "published" }).lean();
    if (!post) return NextResponse.json({ error: "Post not found." }, { status: 404 });
    return NextResponse.json({ post });
  } catch (err) {
    console.error("GET /api/public/blog/[slug] error:", err);
    return NextResponse.json({ error: "Failed to load post." }, { status: 500 });
  }
}
