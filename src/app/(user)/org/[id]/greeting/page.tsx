import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { GreetingViewer } from "@/components/intro/greeting-viewer";
import { notFound } from "next/navigation";

export default async function GreetingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const orgId = Number(id);

  // 1. 해당 조직의 정보 가져오기
  const organization = await prisma.organization.findUnique({
    where: { id: orgId },
    include: {
      // 현재 활성화된 기수(Generation) 찾기 (보통 가장 최근 기수)
      generations: {
        orderBy: { id: "desc" },
        take: 1,
        include: {
          // 그 기수의 '회장' 직책을 가진 사람의 Affiliation 찾기
          affiliations: {
            where: {
              // positionName이나 rank로 회장을 찾아야 함.
              // 여기서는 position이 'Position' 모델과 연결되어 있다고 가정
              Position: {
                rank: 1,
              },
            },
            include: {
              member: true,
              greeting: true, // 인사말 정보 가져오기
              Position: true,
            },
          },
        },
      },
    },
  });

  if (!organization) notFound();

  // 2. 데이터 추출 (복잡한 관계를 풀어냄)
  const currentGen = organization.generations[0];
  const presidentAffiliation = currentGen?.affiliations[0];
  const greeting = presidentAffiliation?.greeting;
  // 3. 보여줄 데이터 결정 (DB에 없으면 기본값)
  const viewData = {
    title: greeting?.title || "소통과 화합으로 새로운 미래를 열어가겠습니다.",
    content:
      greeting?.content ||
      `존경하는 회원 여러분, 안녕하십니까.
    
우리 단체는 지난 시간 동안 회원 여러분의 뜨거운 열정과 헌신으로 오늘날의 괄목할 만한 성장을 이루어냈습니다. 이제 우리는 그 토대 위에서 더욱 단단한 공동체를 만들어야 합니다.

저의 임기 동안 '누구나 오고 싶은 모임', '서로에게 힘이 되는 모임'을 만드는 데 모든 역량을 집중하겠습니다. 이 홈페이지가 그 시작점이 되어, 여러분의 소중한 의견이 살아 숨 쉬는 공간이 되기를 희망합니다.

가정에 평안과 행복이 가득하시길 기원합니다.
감사합니다.`,
    imageUrl: greeting?.imageUrl || presidentAffiliation?.member.image || null, // 인사말 전용 사진 없으면 프로필 사진
    presidentName: presidentAffiliation?.member.name || "공석",
    presidentRole: presidentAffiliation?.Position?.name || "회장",
  };

  return (
    <div className="bg-white min-h-screen">
      {/* 상단 헤더 배경 (선택사항) */}
      <div className="h-48 md:h-64 bg-slate-900 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/pattern.png')] opacity-10" />
        <div className="text-center text-white z-10 px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">회장 인사말</h1>
          <p className="text-slate-300 font-light">
            {organization.name}를 이끌어가는 리더의 메시지입니다.
          </p>
        </div>
      </div>

      {/* 인사말 본문 뷰어 */}
      <GreetingViewer
        title={viewData.title}
        content={viewData.content}
        imageUrl={viewData.imageUrl}
        presidentName={viewData.presidentName}
        presidentRole={`${organization.name} ${currentGen?.name || ""} ${
          viewData.presidentRole
        }`}
      />
    </div>
  );
}
