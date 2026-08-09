import { NextResponse } from "next/server";
import { UAParser } from "ua-parser-js";
import { connectDB } from "@/lib/db";
import Link from "@/lib/models/Link";
import ClickEvent from "@/lib/models/ClickEvent";

export const dynamic = "force-dynamic";

/**
 * Inspects the parsed OS name from ua-parser-js and buckets it into one of
 * the three route classes this product cares about: ios, android, desktop.
 */
function detectPlatform(uaString) {
  const parser = new UAParser(uaString);
  const os = parser.getOS();
  const name = (os.name || "").toLowerCase();

  if (name === "ios") return "ios";
  // iPadOS 13+ reports as "Mac OS" while still carrying a "Mobile" token,
  // which is how we tell a real desktop Safari apart from an iPad.
  if (name === "mac os" && uaString.includes("Mobile")) return "ios";
  if (name === "android") return "android";
  return "desktop";
}

function resolveTarget(link, platform) {
  if (platform === "ios" && link.iosUrl) return link.iosUrl;
  if (platform === "android" && link.androidUrl) return link.androidUrl;
  return link.fallbackUrl;
}

function getClientIp(req) {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

export async function GET(req, { params }) {
  const { alias } = params;

  try {
    await connectDB();
    const link = await Link.findOne({ alias: alias.toLowerCase(), active: true }).lean();

    if (!link) {
      return NextResponse.redirect(new URL("/link-not-found", req.url), { status: 302 });
    }

    const userAgent = req.headers.get("user-agent") || "";
    const platform = detectPlatform(userAgent);
    const destination = resolveTarget(link, platform);
    const referrer = req.headers.get("referer") || req.headers.get("referrer") || "direct";
    const country = req.headers.get("x-vercel-ip-country") || "Unknown";
    const ip = getClientIp(req);

    // Fire-and-forget: don't make the visitor wait on analytics writes.
    Promise.all([
      ClickEvent.create({
        link: link._id,
        alias: link.alias,
        platform,
        ip,
        country,
        referrer,
        userAgent,
        destination,
      }),
      Link.updateOne({ _id: link._id }, { $inc: { clickCount: 1 } }),
    ]).catch((err) => console.error("Click logging failed:", err));

    return NextResponse.redirect(destination, { status: 302 });
  } catch (err) {
    console.error("GET /l/[alias] error:", err);
    return NextResponse.redirect(new URL("/link-not-found", req.url), { status: 302 });
  }
}
