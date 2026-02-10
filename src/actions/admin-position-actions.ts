"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// 1. 직책 생성 (부모 직책 ID를 받음)
export async function createPositionAction(data: {
  organizationId: number;
  name: string;
  parentId: number | null;
  isExecutive: boolean;
  duesCycle: string;
  duesAmount: number;
}) {
  try {
    // 같은 레벨의 마지막 순서(rank) 찾기
    const lastRank = await prisma.position.findFirst({
      where: { organizationId: data.organizationId, parentId: data.parentId },
      orderBy: { rank: "desc" },
    });
    const newRank = (lastRank?.rank || 0) + 1;

    await prisma.position.create({
      data: {
        organizationId: data.organizationId,
        name: data.name,
        parentId: data.parentId,
        rank: newRank,
        isExecutive: data.isExecutive,
        duesCycle: data.duesCycle,
        duesAmount: data.duesAmount,
      },
    });
    revalidatePath("/admin/org-chart");
    return { success: true };
  } catch (e) {
    return { success: false, message: "생성 실패" };
  }
}

// 2. 직책 삭제 (하위 직책이 있으면 삭제 불가 처리 추천)
export async function deletePositionAction(positionId: number) {
  // 하위 직책 체크
  const hasChildren = await prisma.position.count({
    where: { parentId: positionId },
  });
  if (hasChildren > 0) {
    return {
      success: false,
      message:
        "하위 직책이 있어 삭제할 수 없습니다. 하위 직책을 먼저 삭제하세요.",
    };
  }

  await prisma.position.delete({ where: { id: positionId } });
  revalidatePath("/admin/org-chart");
  return { success: true };
}
