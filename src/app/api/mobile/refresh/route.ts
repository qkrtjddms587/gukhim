import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { randomToken, sha256, signAccessToken } from "@/lib/auth/tokens";

const REFRESH_DAYS = 90;

export async function POST(req: Request) {
  const { refreshToken, deviceId } = await req.json();
  if (!refreshToken)
    return NextResponse.json({ message: "missing" }, { status: 400 });

  const tokenHash = sha256(String(refreshToken));

  const row = await prisma.refreshToken.findUnique({ where: { tokenHash } });
  if (!row) return NextResponse.json({ message: "invalid" }, { status: 401 });

  if (row.revokedAt)
    return NextResponse.json({ message: "revoked" }, { status: 401 });
  if (row.expiresAt < new Date())
    return NextResponse.json({ message: "expired" }, { status: 401 });

  // (권장) deviceId 바인딩: 토큰 탈취 방지
  if (row.deviceId && deviceId && row.deviceId !== String(deviceId)) {
    return NextResponse.json({ message: "device mismatch" }, { status: 401 });
  }

  // rotation: 기존 토큰 revoke + 새 토큰 발급
  const newRefresh = randomToken(48);
  const newHash = sha256(newRefresh);
  const expiresAt = new Date(Date.now() + REFRESH_DAYS * 24 * 60 * 60 * 1000);

  await prisma.$transaction([
    prisma.refreshToken.update({
      where: { tokenHash },
      data: { revokedAt: new Date() },
    }),
    prisma.refreshToken.create({
      data: {
        memberId: row.memberId,
        tokenHash: newHash,
        deviceId: row.deviceId,
        expiresAt,
        replacedBy: row.id, // 필요 없으면 제거
      },
    }),
  ]);

  const accessToken = await signAccessToken({ sub: String(row.memberId) });

  return NextResponse.json({ accessToken, refreshToken: newRefresh });
}
