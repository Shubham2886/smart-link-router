import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Link from "@/lib/models/Link";

export const dynamic = "force-dynamic";

const ALIAS_RE = /^[a-z0-9-_]+$/;

function validatePayload(body) {
  const errors = {};
  const alias = (body.alias || "").trim().toLowerCase();
  const title = (body.title || "").trim();
  const fallbackUrl = (body.fallbackUrl || "").trim();
  const iosUrl = (body.iosUrl || "").trim();
  const androidUrl = (body.androidUrl || "").trim();

  if (!alias) errors.alias = "Alias is required.";
  else if (!ALIAS_RE.test(alias))
    errors.alias = "Only lowercase letters, numbers, hyphens and underscores allowed.";

  if (!title) errors.title = "Title is required.";
  if (!fallbackUrl) errors.fallbackUrl = "A fallback / desktop URL is required.";

  const urlLike = (v) => !v || /^https?:\/\/.+/i.test(v);
  if (!urlLike(fallbackUrl)) errors.fallbackUrl = "Must be a valid http(s) URL.";
  if (!urlLike(iosUrl)) errors.iosUrl = "Must be a valid http(s) URL.";
  if (!urlLike(androidUrl)) errors.androidUrl = "Must be a valid http(s) URL.";

  return { errors, data: { alias, title, fallbackUrl, iosUrl, androidUrl } };
}

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim();

    const filter = q
      ? { $or: [{ alias: new RegExp(q, "i") }, { title: new RegExp(q, "i") }] }
      : {};

    const links = await Link.find(filter).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ links });
  } catch (err) {
    console.error("GET /api/links error:", err);
    return NextResponse.json({ error: "Failed to load links." }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { errors, data } = validatePayload(body);

    if (Object.keys(errors).length) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    const exists = await Link.findOne({ alias: data.alias }).lean();
    if (exists) {
      return NextResponse.json(
        { errors: { alias: "This alias is already taken." } },
        { status: 409 }
      );
    }

    const link = await Link.create({
      ...data,
      active: body.active !== undefined ? !!body.active : true,
    });

    return NextResponse.json({ link }, { status: 201 });
  } catch (err) {
    console.error("POST /api/links error:", err);
    return NextResponse.json({ error: "Failed to create link." }, { status: 500 });
  }
}
