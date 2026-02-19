import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { randomToken } from "@/lib/auth/tokens";
import { verifyAccessToken } from "@/lib/auth/tokens";

export async function POST(req: Request) {
  const authz = req.headers.get("authorization") || "";
  const token = authz.startsWith("Bearer ") ? authz.slice(7) : null;
  if (!token)
    return NextResponse.json({ message: "missing token" }, { status: 401 });

  let payload: any;
  try {
    payload = await verifyAccessToken(token);
  } catch {
    return NextResponse.json({ message: "invalid token" }, { status: 401 });
  }

  const memberId = Number(payload.sub);
  if (!memberId)
    return NextResponse.json({ message: "invalid sub" }, { status: 401 });

  const code = randomToken(32);
  const expiresAt = new Date(Date.now() + 60 * 1000);

  await prisma.loginCode.create({ data: { code, memberId, expiresAt } });

  return NextResponse.json({ code, expiresAt });
}
