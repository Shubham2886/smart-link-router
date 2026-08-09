import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import BlogPost from "@/lib/models/BlogPost";

export const dynamic = "force-dynamic";

const SLUG_RE = /^[a-z0-9-]+$/;

function slugify(input) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const q = searchParams.get("q")?.trim();

    const filter = {};
    if (status && ["draft", "published"].includes(status)) filter.status = status;
    if (q) filter.title = new RegExp(q, "i");

    const posts = await BlogPost.find(filter).sort({ updatedAt: -1 }).lean();
    return NextResponse.json({ posts });
  } catch (err) {
    console.error("GET /api/blog error:", err);
    return NextResponse.json({ error: "Failed to load posts." }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    const title = (body.title || "").trim();
    let slug = (body.slug || "").trim().toLowerCase() || slugify(title);
    slug = slugify(slug);
    const content = (body.content || "").trim();
    const status = body.status === "published" ? "published" : "draft";

    const errors = {};
    if (!title) errors.title = "Title is required.";
    if (!slug || !SLUG_RE.test(slug)) errors.slug = "Slug must be lowercase letters, numbers and hyphens.";
    if (!content) errors.content = "Content is required.";

    if (Object.keys(errors).length) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    const exists = await BlogPost.findOne({ slug }).lean();
    if (exists) {
      return NextResponse.json({ errors: { slug: "This slug is already in use." } }, { status: 409 });
    }

    const post = await BlogPost.create({
      title,
      slug,
      content,
      featuredImage: (body.featuredImage || "").trim(),
      author: (body.author || "").trim() || "Admin",
      excerpt: (body.excerpt || "").trim(),
      status,
      publishedAt: status === "published" ? new Date() : null,
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (err) {
    console.error("POST /api/blog error:", err);
    return NextResponse.json({ error: "Failed to create post." }, { status: 500 });
  }
}
