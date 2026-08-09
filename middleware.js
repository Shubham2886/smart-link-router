import { NextResponse } from "next/server";
import { AUTH_COOKIE, verifyToken } from "@/lib/auth";

const PROTECTED_PAGE_PREFIX = "/admin";
const PUBLIC_ADMIN_PATHS = ["/admin/login"];
const PROTECTED_API_PREFIXES = ["/api/links", "/api/blog", "/api/stats"];

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  const isProtectedPage =
    pathname.startsWith(PROTECTED_PAGE_PREFIX) &&
    !PUBLIC_ADMIN_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));

  const isProtectedApi = PROTECTED_API_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );

  if (!isProtectedPage && !isProtectedApi) {
    return NextResponse.next();
  }

  const token = req.cookies.get(AUTH_COOKIE)?.value;
  const payload = token ? await verifyToken(token) : null;

  if (!payload) {
    if (isProtectedApi) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in to the admin panel." },
        { status: 401 }
      );
    }
    const loginUrl = new URL("/admin/login", req.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/links/:path*", "/api/blog/:path*"],
};
