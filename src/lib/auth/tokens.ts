import crypto from "crypto";
import { SignJWT, jwtVerify } from "jose";

const enc = new TextEncoder();
const JWT_SECRET = process.env.JWT_SECRET!; // 32+ chars 권장

export function randomToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString("base64url"); // refresh/loginCode용
}

export function sha256(input: string) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

export async function signAccessToken(payload: { sub: string }) {
  return new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(enc.encode(JWT_SECRET));
}

export async function verifyAccessToken(token: string) {
  const { payload } = await jwtVerify(token, enc.encode(JWT_SECRET));
  return payload; // payload.sub 사용
}
