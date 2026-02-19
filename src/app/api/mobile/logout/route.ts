import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sha256 } from "@/lib/auth/tokens";

export async function POST(req: Request) {
  const { refreshToken } = await req.json();
  if (!refreshToken)
    return NextResponse.json({ message: "missing" }, { status: 400 });

  const tokenHash = sha256(String(refreshToken));

  await prisma.refreshToken.updateMany({
    where: { tokenHash, revokedAt: null },
    data: { revokedAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
