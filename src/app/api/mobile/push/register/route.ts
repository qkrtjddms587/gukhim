import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAccessToken } from "@/lib/auth/tokens";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = await verifyAccessToken(token);
    if (!decoded || !decoded.sub) {
      return NextResponse.json(
        { message: "Invalid or expired token" },
        { status: 401 }
      );
    }
    const memberId = Number(decoded.sub);
    const { token: pushToken, platform, deviceId } = await req.json();

    // 기존에 같은 토큰이 있는지 확인 후 없으면 생성 (또는 기기 ID 기준으로 업데이트)
    await prisma.devicePushToken.upsert({
      where: {
        platform_token: { platform, token: pushToken }, // 스키마에 선언하신 @@unique 활용
      },
      update: {
        memberId,
        deviceId,
      },
      create: {
        memberId,
        platform,
        token: pushToken,
        deviceId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("푸시 토큰 저장 에러:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
