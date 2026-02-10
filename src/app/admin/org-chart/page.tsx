import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { OrgChartEditor } from "@/components/admin/org-chart-editor";

export default async function AdminOrgChartPage() {
  const session = await auth();
  // ... 권한 체크 로직 ...

  // 현재 관리자의 조직 ID 가져오기
  const myAffiliation = await prisma.affiliation.findFirst({
    where: { memberId: Number(session?.user?.id) },
  });

  if (!myAffiliation) return <div>권한이 없습니다.</div>;

  // 모든 직책 가져오기 (Rank 순서대로)
  const positions = await prisma.position.findMany({
    where: { organizationId: myAffiliation.organizationId },
    orderBy: { rank: "asc" },
  });

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">조직도(직책) 관리</h1>
      <p className="text-slate-500 mb-8">
        조직의 위계 구조를 설정합니다. 여기서 만든 직책은 회원 관리 페이지에서
        할당할 수 있습니다.
      </p>

      <OrgChartEditor
        positions={positions}
        orgId={myAffiliation.organizationId}
      />
    </div>
  );
}
