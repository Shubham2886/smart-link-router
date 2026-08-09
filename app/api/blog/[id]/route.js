import { NextResponse } from "next/server";
import mongoose from "mongoose";
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

export async function GET(_req, { params }) {
  try {
    await connectDB();
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "Invalid post id." }, { status: 400 });
    }
    const post = await BlogPost.findById(params.id).lean();
    if (!post) return NextResponse.json({ error: "Post not found." }, { status: 404 });
    return NextResponse.json({ post });
  } catch (err) {
    console.error("GET /api/blog/[id] error:", err);
    return NextResponse.json({ error: "Failed to load post." }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    await connectDB();
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "Invalid post id." }, { status: 400 });
    }

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

    const clash = await BlogPost.findOne({ slug, _id: { $ne: params.id } }).lean();
    if (clash) {
      return NextResponse.json({ errors: { slug: "This slug is already in use." } }, { status: 409 });
    }

    const existing = await BlogPost.findById(params.id);
    if (!existing) return NextResponse.json({ error: "Post not found." }, { status: 404 });

    const wasPublished = existing.status === "published";
    const nowPublishing = status === "published";

    existing.title = title;
    existing.slug = slug;
    existing.content = content;
    existing.featuredImage = (body.featuredImage || "").trim();
    existing.author = (body.author || "").trim() || "Admin";
    existing.excerpt = (body.excerpt || "").trim();
    existing.status = status;
    if (!wasPublished && nowPublishing) existing.publishedAt = new Date();
    if (!nowPublishing) existing.publishedAt = null;

    await existing.save();

    return NextResponse.json({ post: existing });
  } catch (err) {
    console.error("PUT /api/blog/[id] error:", err);
    return NextResponse.json({ error: "Failed to update post." }, { status: 500 });
  }
}

export async function DELETE(_req, { params }) {
  try {
    await connectDB();
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "Invalid post id." }, { status: 400 });
    }
    const post = await BlogPost.findByIdAndDelete(params.id);
    if (!post) return NextResponse.json({ error: "Post not found." }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/blog/[id] error:", err);
    return NextResponse.json({ error: "Failed to delete post." }, { status: 500 });
  }
}
