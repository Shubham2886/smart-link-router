import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Link from "@/lib/models/Link";
import ClickEvent from "@/lib/models/ClickEvent";

export const dynamic = "force-dynamic";

const ALIAS_RE = /^[a-z0-9-_]+$/;

function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

export async function GET(_req, { params }) {
  try {
    await connectDB();
    if (!isValidId(params.id)) {
      return NextResponse.json({ error: "Invalid link id." }, { status: 400 });
    }
    const link = await Link.findById(params.id).lean();
    if (!link) return NextResponse.json({ error: "Link not found." }, { status: 404 });
    return NextResponse.json({ link });
  } catch (err) {
    console.error("GET /api/links/[id] error:", err);
    return NextResponse.json({ error: "Failed to load link." }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    await connectDB();
    if (!isValidId(params.id)) {
      return NextResponse.json({ error: "Invalid link id." }, { status: 400 });
    }

    const body = await req.json();
    const alias = (body.alias || "").trim().toLowerCase();
    const title = (body.title || "").trim();
    const fallbackUrl = (body.fallbackUrl || "").trim();
    const iosUrl = (body.iosUrl || "").trim();
    const androidUrl = (body.androidUrl || "").trim();

    const errors = {};
    if (!alias) errors.alias = "Alias is required.";
    else if (!ALIAS_RE.test(alias))
      errors.alias = "Only lowercase letters, numbers, hyphens and underscores allowed.";
    if (!title) errors.title = "Title is required.";
    if (!fallbackUrl) errors.fallbackUrl = "A fallback / desktop URL is required.";
    const urlLike = (v) => !v || /^https?:\/\/.+/i.test(v);
    if (!urlLike(fallbackUrl)) errors.fallbackUrl = "Must be a valid http(s) URL.";
    if (!urlLike(iosUrl)) errors.iosUrl = "Must be a valid http(s) URL.";
    if (!urlLike(androidUrl)) errors.androidUrl = "Must be a valid http(s) URL.";

    if (Object.keys(errors).length) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    const clash = await Link.findOne({ alias, _id: { $ne: params.id } }).lean();
    if (clash) {
      return NextResponse.json(
        { errors: { alias: "This alias is already taken." } },
        { status: 409 }
      );
    }

    const link = await Link.findByIdAndUpdate(
      params.id,
      {
        alias,
        title,
        fallbackUrl,
        iosUrl,
        androidUrl,
        active: body.active !== undefined ? !!body.active : true,
      },
      { new: true, runValidators: true }
    );

    if (!link) return NextResponse.json({ error: "Link not found." }, { status: 404 });
    return NextResponse.json({ link });
  } catch (err) {
    console.error("PUT /api/links/[id] error:", err);
    return NextResponse.json({ error: "Failed to update link." }, { status: 500 });
  }
}

export async function DELETE(_req, { params }) {
  try {
    await connectDB();
    if (!isValidId(params.id)) {
      return NextResponse.json({ error: "Invalid link id." }, { status: 400 });
    }
    const link = await Link.findByIdAndDelete(params.id);
    if (!link) return NextResponse.json({ error: "Link not found." }, { status: 404 });
    await ClickEvent.deleteMany({ link: params.id });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/links/[id] error:", err);
    return NextResponse.json({ error: "Failed to delete link." }, { status: 500 });
  }
}
