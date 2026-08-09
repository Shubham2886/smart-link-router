import { SignJWT, jwtVerify } from "jose";

const secretString = process.env.JWT_SECRET || "dev-only-insecure-secret-change-me";
const secret = new TextEncoder().encode(secretString);

export const AUTH_COOKIE = "slr_session";
export const AUTH_MAX_AGE = 60 * 60 * 24 * 7; // 7 days, in seconds

export async function signToken(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    return null;
  }
}
