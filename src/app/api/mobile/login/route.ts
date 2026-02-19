import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { randomToken, sha256, signAccessToken } from "@/lib/auth/tokens";

const REFRESH_DAYS = 90;

export async function POST(req: Request) {
  const { loginId, password, deviceId, userAgent } = await req.json();

  if (!loginId || !password) {
    return NextResponse.json(
      { message: "missing credentials" },
      { status: 400 }
    );
  }

  const member = await prisma.member.findUnique({
    where: { loginId: String(loginId) },
  });
  if (!member)
    return NextResponse.json({ message: "invalid" }, { status: 401 });

  const ok = await bcrypt.compare(String(password), member.password);
  if (!ok) return NextResponse.json({ message: "invalid" }, { status: 401 });

  const accessToken = await signAccessToken({ sub: String(member.id) });

  const refreshToken = randomToken(48);
  const tokenHash = sha256(refreshToken);

  const expiresAt = new Date(Date.now() + REFRESH_DAYS * 24 * 60 * 60 * 1000);

  await prisma.refreshToken.create({
    data: {
      memberId: member.id,
      tokenHash,
      deviceId: deviceId ? String(deviceId) : null,
      userAgent: userAgent ? String(userAgent) : null,
      expiresAt,
    },
  });

  return NextResponse.json({
    accessToken,
    refreshToken,
    member: { id: member.id, name: member.name, loginId: member.loginId },
  });
}
