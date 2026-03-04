"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createBannerAction(formData: FormData) {
  try {
    const title = formData.get("title") as string;
    const imageUrl = formData.get("imageUrl") as string;
    const linkUrl = formData.get("linkUrl") as string;
    const position = formData.get("position") as string;
    const orgId = formData.get("organizationId") as string;
    const displayOrder = Number(formData.get("displayOrder")) || 0;
    const isActive = formData.get("isActive") === "on";

    // 날짜 처리 (값이 있으면 Date 객체로, 없으면 null)
    const startDateStr = formData.get("startDate") as string;
    const endDateStr = formData.get("endDate") as string;
    const startDate = startDateStr ? new Date(startDateStr) : null;
    const endDate = endDateStr ? new Date(endDateStr) : null;

    if (!imageUrl) {
      return { success: false, error: "이미지 URL은 필수입니다." };
    }

    await prisma.banner.create({
      data: {
        title: title || null,
        imageUrl,
        linkUrl: linkUrl || null,
        organizationId: orgId && orgId !== "all" ? Number(orgId) : null,
        displayOrder,
        isActive,
        startDate,
        endDate,
      },
    });

    revalidatePath("/admin/banners");
    return { success: true };
  } catch (error) {
    console.error("[CREATE_BANNER_ERROR]", error);
    return { success: false, error: "배너 등록 중 오류가 발생했습니다." };
  }
}

export async function deleteBannerAction(id: number) {
  try {
    await prisma.banner.delete({ where: { id } });
    revalidatePath("/admin/banners");
    return { success: true };
  } catch (error) {
    return { success: false, error: "배너 삭제 실패" };
  }
}
