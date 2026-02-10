"use server";

import { prisma } from "@/lib/prisma";

// React Query에서 pageParam을 넘겨줄 것입니다.
export async function getMembersAction({
  orgId,
  page = 1, // pageParam이 여기로 들어옴
  query = "",
  generationId,
}: {
  orgId: number;
  page: number;
  query: string;
  generationId: string;
}) {
  const ITEMS_PER_PAGE = 20;

  const whereCondition = {
    organizationId: orgId,
    status: "ACTIVE" as const,
    OR: query
      ? [
          { member: { name: { contains: query } } },
          { member: { phone: { contains: query } } },
          { member: { company: { contains: query } } },
        ]
      : undefined,
    generationId:
      generationId && generationId !== "all" ? Number(generationId) : undefined,
  };

  const members = await prisma.affiliation.findMany({
    where: whereCondition,
    take: ITEMS_PER_PAGE,
    skip: (page - 1) * ITEMS_PER_PAGE,
    include: {
      member: true,
      generation: true,
    },
    orderBy: { generation: { name: "desc" } },
  });

  // 다음 페이지가 있는지 계산 (가져온 개수가 Limit과 같으면 다음 페이지가 있다고 가정)
  const nextId = members.length === ITEMS_PER_PAGE ? page + 1 : null;

  // React Query가 사용할 수 있는 객체 형태로 반환
  return {
    data: members,
    nextId, // 다음 페이지 번호 (없으면 null)
  };
}
