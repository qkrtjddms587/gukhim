import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserPlus, CreditCard, Activity } from "lucide-react";
import { AdminCharts } from "@/components/admin/admin-charts";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  // 권한 체크
  const myAffiliation = await prisma.affiliation.findFirst({
    where: { memberId: Number(session.user.id) },
  });
  if (!myAffiliation || myAffiliation.role === "USER") redirect("/");

  // --------------------------------------------------------
  // 1. 핵심 지표 데이터 조회 (병렬 처리로 속도 최적화)
  // --------------------------------------------------------
  const now = new Date();

  const [totalMembers, pendingMembers, activeMembers, paidMembers] =
    await Promise.all([
      // 전체 회원 수
      prisma.member.count(),

      // 승인 대기중인 수
      prisma.affiliation.count({ where: { status: "PENDING" } }),

      // 현재 활동 중인(승인된) 회원 수
      prisma.affiliation.count({ where: { status: "ACTIVE" } }),

      // 정회원(유효기간 남은 사람) 수
      prisma.affiliation.count({
        where: {
          status: "ACTIVE",
          membershipExpiresAt: { gt: now },
        },
      }),
    ]);

  // 예상 수익 (정회원 수 * 50,000원) - 나중엔 실제 결제 테이블 sum으로 교체
  const totalRevenue = paidMembers * 50000;

  // --------------------------------------------------------
  // 2. 차트용 데이터 가공
  // --------------------------------------------------------
  const statusData = [
    { name: "정회원 (납부)", value: paidMembers, color: "#2563eb" }, // 파랑
    {
      name: "일반 (미납)",
      value: activeMembers - paidMembers,
      color: "#f59e0b",
    }, // 노랑
    { name: "승인 대기", value: pendingMembers, color: "#ef4444" }, // 빨강
  ];

  // (임시) 월별 데이터 더미 - 나중엔 prisma groupBy로 실제 데이터 연동 가능
  const monthlyData = [
    { name: "9월", total: 12 },
    { name: "10월", total: 18 },
    { name: "11월", total: 25 },
    { name: "12월", total: 40 },
    { name: "1월", total: totalMembers - 5 }, // 예시
    { name: "2월", total: totalMembers },
  ];

  return (
    <div className="p-6 space-y-8 bg-slate-50 min-h-screen">
      {/* 헤더 섹션 */}
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">대시보드</h2>
        <div className="text-sm text-muted-foreground">
          오늘 날짜: {new Date().toLocaleDateString()}
        </div>
      </div>

      {/* 1. 상단 KPI 카드 섹션 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 회원수</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMembers}명</div>
            <p className="text-xs text-muted-foreground">+20.1% 지난달 대비</p>
          </CardContent>
        </Card>

        {/* 클릭하면 승인 페이지로 이동하게 만듦 */}
        <Link href="/admin/members">
          <Card className="cursor-pointer hover:border-red-400 transition-colors border-l-4 border-l-red-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-600">
                승인 대기
              </CardTitle>
              <UserPlus className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {pendingMembers}명
              </div>
              <p className="text-xs text-red-400">지금 승인이 필요합니다!</p>
            </CardContent>
          </Card>
        </Link>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">현재 정회원</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {paidMembers}명
            </div>
            <p className="text-xs text-muted-foreground">
              전체 회원의 {Math.round((paidMembers / totalMembers) * 100 || 0)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              올해 예상 수익
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₩{totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">연회비 5만원 기준</p>
          </CardContent>
        </Card>
      </div>

      {/* 2. 차트 섹션 */}
      <AdminCharts monthlyData={monthlyData} statusData={statusData} />
    </div>
  );
}
