"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// 소속 추가
export async function createOrganizationAction(formData: FormData) {
  const name = formData.get("name") as string;
  if (!name) return { success: false, message: "이름을 입력하세요." };

  try {
    await prisma.organization.create({ data: { name } });
    revalidatePath("/admin/orgs"); // 화면 새로고침
    return { success: true, message: "추가되었습니다." };
  } catch (e) {
    return { success: false, message: "이미 존재하는 소속명입니다." };
  }
}

// 기수 추가
export async function createGenerationAction(formData: FormData) {
  const orgId = Number(formData.get("orgId"));
  const name = formData.get("name") as string;

  if (!name || !orgId) return { success: false, message: "정보가 부족합니다." };

  try {
    await prisma.generation.create({
      data: { name, organizationId: orgId },
    });
    revalidatePath("/admin/orgs");
    return { success: true, message: "기수가 추가되었습니다." };
  } catch (e) {
    return { success: false, message: "중복된 기수명입니다." };
  }
}

export async function deleteOrganizationAction(id: number) {
  try {
    await prisma.organization.update({
      where: { id },
      data: { deletedAt: new Date() }, // 현재 시간 기록 = 삭제 처리
    });
    revalidatePath("/admin/orgs");
    return { success: true, message: "단체가 삭제되었습니다." };
  } catch (e) {
    return { success: false, message: "삭제 실패" };
  }
}

// 기수 삭제 (Soft Delete)
export async function deleteGenerationAction(id: number) {
  try {
    await prisma.generation.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    revalidatePath("/admin/orgs");
    return { success: true, message: "기수가 삭제되었습니다." };
  } catch (e) {
    return { success: false, message: "삭제 실패" };
  }
}

export async function getOrgNameAction(orgId: number) {
  try {
    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      select: { name: true }, // 이름만 조회
    });
    return org?.name || "";
  } catch (error) {
    return "";
  }
}
