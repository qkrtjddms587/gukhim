import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { redirect } from "next/navigation";
import { MemberDetailSheet } from "@/components/admin/member-detail-sheet-v2";

export default async function AdminMembersPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const myAffiliation = await prisma.affiliation.findFirst({
    where: { memberId: Number(session.user.id) },
  });

  // 권한 체크
  if (!myAffiliation || myAffiliation.role === "USER") redirect("/");
  const iAmAdmin = myAffiliation.role === "ADMIN";

  const affiliations = await prisma.affiliation.findMany({
    include: {
      member: true,
      organization: true,
      generation: true,
      Position: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-4 bg-slate-100 min-h-screen">
      <Card>
        <CardHeader>
          <CardTitle>회원 승인 및 관리</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>이름</TableHead>
                <TableHead>소속</TableHead>
                <TableHead>상태</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {affiliations.map((aff) => {
                const now = new Date();
                const isRegular =
                  aff.status === "ACTIVE" &&
                  aff.membershipExpiresAt &&
                  aff.membershipExpiresAt > now;

                return (
                  <TableRow key={aff.id}>
                    <TableCell className="font-medium">
                      <MemberDetailSheet affiliation={aff}>
                        <button className="hover:underline hover:text-brand-main text-left font-bold flex items-center gap-2">
                          {aff.member.name}
                        </button>
                      </MemberDetailSheet>
                    </TableCell>
                    <TableCell>
                      {aff.organization.name} {aff.generation.name}
                    </TableCell>

                    {/* 상태 뱃지 */}
                    <TableCell>
                      {/* 1. 승인 대기 */}
                      {aff.status === "PENDING" && (
                        <Badge
                          variant="outline"
                          className="text-orange-500 border-orange-200"
                        >
                          승인 대기
                        </Badge>
                      )}

                      {/* 2. 반려됨 */}
                      {aff.status === "REJECTED" && (
                        <Badge variant="destructive">반려됨</Badge>
                      )}

                      {/* 3. 활동중 (ACTIVE) */}
                      {aff.status === "ACTIVE" && (
                        <>
                          {aff.Position?.name ? (
                            // 🥇 1순위: 직책이 있으면 직책 표시 (진한 색상)
                            <Badge className="bg-slate-800 hover:bg-slate-700 text-white border-transparent">
                              {aff.Position.name}
                            </Badge>
                          ) : isRegular ? (
                            // 🥈 2순위: 직책 없고, 정회원 조건 충족 시
                            <Badge className="bg-blue-600 hover:bg-blue-700 border-transparent">
                              정회원
                            </Badge>
                          ) : (
                            // 🥉 3순위: 그 외 일반회원
                            <Badge
                              variant="secondary"
                              className="text-slate-600 bg-slate-100"
                            >
                              일반회원
                            </Badge>
                          )}
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
