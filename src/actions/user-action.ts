"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// 유효성 검사 스키마
const ProfileSchema = z.object({
  company: z.string().optional(),
  job: z.string().optional(),
  address: z.string().optional(),
  // 필요하다면 이메일이나 전화번호 변경 로직도 추가 가능
});

export async function updateMyProfileAction(
  data: z.infer<typeof ProfileSchema>
) {
  const session = await auth();
  if (!session?.user?.id)
    return { success: false, message: "로그인이 필요합니다." };

  try {
    await prisma.member.update({
      where: { id: Number(session.user.id) }, // 👈 내 ID로만 수정 가능 (보안)
      data: {
        company: data.company || null,
        job: data.job || null,
        address: data.address || null,
      },
    });

    revalidatePath("/profile"); // 프로필 페이지 갱신
    revalidatePath("/search"); // 검색 결과에서도 바뀌어야 함
    return { success: true, message: "내 정보가 수정되었습니다." };
  } catch (error) {
    console.error(error);
    return { success: false, message: "수정 중 오류가 발생했습니다." };
  }
}
