"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function joinOrganizationAction(orgId: number, genId: number) {
  const session = await auth();
  if (!session?.user?.id)
    return { success: false, message: "로그인이 필요합니다." };

  try {
    // 이미 가입된 곳인지 체크
    const existing = await prisma.affiliation.findFirst({
      where: {
        memberId: Number(session.user.id),
        organizationId: orgId,
        generationId: genId,
      },
    });

    if (existing) {
      return { success: false, message: "이미 가입 신청된 소속입니다." };
    }

    // 가입 신청 (기본값: PENDING, USER)
    await prisma.affiliation.create({
      data: {
        memberId: Number(session.user.id),
        organizationId: orgId,
        generationId: genId,
        updatedAt: new Date(), // 필수
      },
    });

    revalidatePath("/"); // 메인 화면 갱신
    return {
      success: true,
      message: "가입 신청이 완료되었습니다. 승인을 기다려주세요.",
    };
  } catch (error) {
    console.error(error);
    return { success: false, message: "가입 신청 중 오류가 발생했습니다." };
  }
}
