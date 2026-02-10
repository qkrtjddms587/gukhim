"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import bcrypt from "bcryptjs";

const CreateUserSchema = z.object({
  loginId: z.string().min(4, "아이디는 4자 이상 입력해주세요"), // 👈 추가됨
  name: z.string().min(1, "이름을 입력해주세요"),
  phone: z.string().min(10, "휴대폰 번호를 입력해주세요"),
  organizationId: z.string(),
  generationId: z.string(),
  position: z.string().optional(),
  company: z.string().optional(),
  job: z.string().optional(),
});

export async function createMemberByAdminAction(
  data: z.infer<typeof CreateUserSchema>
) {
  const session = await auth();
  // 권한 체크...

  const orgId = Number(data.organizationId);
  const genId = Number(data.generationId);

  // 비밀번호는 편의상 '전화번호 숫자만(하이픈 제거)'로 설정 (01012345678)
  const defaultPassword = data.phone.replace(/-/g, "");

  try {
    // 1. 중복 확인 (아이디 OR 전화번호)
    // 이미 있는 회원이면 '소속 추가' 로직으로 넘어가야 하므로 조회
    let member = await prisma.member.findFirst({
      where: {
        OR: [{ loginId: data.loginId }, { phone: data.phone }],
      },
    });

    // 2. 신규 회원이면 생성
    if (!member) {
      // 아이디 중복 체크 (혹시 전화번호는 다른데 아이디가 겹칠 수 있으니)
      const existingId = await prisma.member.findUnique({
        where: { loginId: data.loginId },
      });
      if (existingId) {
        return { success: false, message: "이미 사용 중인 아이디입니다." };
      }

      const hashedPassword = await bcrypt.hash(defaultPassword, 10);

      member = await prisma.member.create({
        data: {
          loginId: data.loginId, // 👈 관리자가 입력한 값
          name: data.name,
          phone: data.phone,
          password: hashedPassword,
          company: data.company,
          job: data.job,
        },
      });
    } else {
      // 기존 회원이 발견된 경우
      // 만약 입력한 ID와 기존 회원의 ID가 다르다면? -> 기존 회원 ID 유지 or 에러?
      // 여기서는 기존 회원 정보를 우선시하고 소속만 추가합니다.
      if (member.loginId !== data.loginId) {
        return {
          success: false,
          message: `이미 등록된 전화번호입니다. (기존 ID: ${member.loginId})`,
        };
      }

      // 정보 업데이트
      await prisma.member.update({
        where: { id: member.id },
        data: {
          company: member.company ? undefined : data.company,
          job: member.job ? undefined : data.job,
        },
      });
    }

    // 3. 소속(Affiliation) 추가
    const existingAff = await prisma.affiliation.findFirst({
      where: { memberId: member.id, organizationId: orgId },
    });

    if (existingAff) {
      return { success: false, message: "이미 해당 단체에 등록된 회원입니다." };
    }

    await prisma.affiliation.create({
      data: {
        memberId: member.id,
        organizationId: orgId,
        generationId: genId,
        status: "ACTIVE",
        role: "USER",
      },
    });

    revalidatePath("/admin/members");
    return { success: true, message: "회원 등록 완료!" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "등록 중 오류가 발생했습니다." };
  }
}
