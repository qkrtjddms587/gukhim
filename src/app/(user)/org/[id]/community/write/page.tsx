import { auth } from "@/auth";
import { WriteForm } from "@/components/community/write-form";
import { prisma } from "@/lib/prisma";

export default async function WritePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const orgId = Number(id);
  const session = await auth();

  // 관리자 여부 확인 (공지사항 작성 권한용)
  const affiliation = await prisma.affiliation.findFirst({
    where: {
      memberId: Number(session?.user?.id),
      organizationId: orgId,
    },
  });

  const isAdmin =
    affiliation?.role === "ADMIN" || affiliation?.role === "MANAGER";

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-6">글쓰기</h1>

      {/* 🌟 클라이언트 폼 컴포넌트로 데이터 넘기기 */}
      <WriteForm orgId={orgId} isAdmin={isAdmin} />
    </div>
  );
}
