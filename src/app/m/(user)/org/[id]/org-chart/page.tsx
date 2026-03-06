import { IntroTabs } from "@/components/common/intro-tabs";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ gen?: string }>;
}

export default async function UserOrgChartPage({
  params,
  searchParams,
}: Props) {
  const { id } = await params;
  const { gen } = await searchParams;

  if (!id || isNaN(Number(id))) return notFound();

  // 1. 조직 및 기수 로드
  const generations = await prisma.generation.findMany({
    where: { organizationId: Number(id), deletedAt: null },
    orderBy: [{ isPrimary: "desc" }, { name: "desc" }],
    include: { organization: true },
  });

  if (generations.length === 0) {
    return (
      <div className="p-10 text-center text-slate-500">
        등록된 기수가 없습니다.
      </div>
    );
  }

  const currentGenId = gen ? Number(gen) : generations[0].id;
  const currentGen =
    generations.find((g) => g.id === currentGenId) || generations[0];

  // 2. 직책(Position) 및 소속 회원 로드 (rank 오름차순)
  const positionsWithMembers = await prisma.position.findMany({
    where: { generationId: currentGenId },
    orderBy: { rank: "asc" },
    include: {
      affiliations: {
        where: { status: "ACTIVE" },
        include: { member: true },
        orderBy: { member: { name: "asc" } },
      },
    },
  });

  // 🌟 3. rank(순위)를 기준으로 직책들을 그룹화합니다. (핵심 로직)
  // 같은 rank를 가진 직책들끼리 같은 가로줄(Row)에 배치하기 위함입니다.
  const rankGroups = positionsWithMembers.reduce((acc, pos) => {
    if (pos.affiliations.length === 0) return acc; // 사람 없는 직책은 숨김
    if (!acc[pos.rank]) acc[pos.rank] = [];
    acc[pos.rank].push(pos);
    return acc;
  }, {} as Record<number, typeof positionsWithMembers>);

  const sortedRanks = Object.keys(rankGroups)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <div className="relative">
      <IntroTabs orgId={Number(id)} currentTab="orgchart" />
      <div className="max-w-4xl mx-auto px-4 py-16 min-h-screen bg-white font-sans">
        {/* 🌟 타이틀 영역 (이미지와 동일한 붉은 사각형 데코레이션) */}
        <div className="flex flex-col items-center justify-center gap-2 mb-16 text-center">
          <div className="flex items-center justify-center gap-3">
            <div className="w-5 h-5 bg-brand-main -skew-x-12 shadow-sm" />
            <h1 className="text-2xl md:text-3xl font-black text-[#152a4e] tracking-tight whitespace-pre-wrap">
              {currentGen.organization.name} {currentGen.name}
            </h1>
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-[#152a4e] tracking-widest mt-1">
            조 직 도
          </h2>
        </div>

        {/* 🌟 조직도 트리 영역 */}
        <div className="flex flex-col items-center space-y-8">
          {sortedRanks.map((rank, index) => {
            const positionsInThisRank = rankGroups[rank];
            const isPresidentRank = index === 0; // 가장 첫 번째 랭크(회장)는 빨간색

            return (
              // 랭크별 가로 줄 (1개면 중앙 정렬, 여러 개면 그리드 정렬)
              <div
                key={rank}
                className={`w-full flex justify-center gap-4 md:gap-6 flex-wrap`}
              >
                {positionsInThisRank.map((position) => (
                  <OrgBox
                    key={position.id}
                    title={position.name}
                    members={position.affiliations}
                    isLeader={isPresidentRank}
                    // 직책이 여러 개면 박스 크기를 제한해서 나란히 놓이게 함
                    className={
                      positionsInThisRank.length === 1
                        ? "w-full max-w-[320px]"
                        : "w-full max-w-[260px] flex-1"
                    }
                  />
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// 🎨 이미지 스타일을 완벽 재현한 개별 조직도 박스 컴포넌트
function OrgBox({
  title,
  members,
  isLeader = false,
  className = "",
}: {
  title: string;
  members: any[];
  isLeader?: boolean;
  className?: string;
}) {
  // 박스 안의 인원 수에 따라 그리드 컬럼 조절 (2명이면 2칸, 3명이면 2칸(자동줄바꿈) 등)
  const gridCols = members.length > 1 ? "grid-cols-2" : "grid-cols-1";

  return (
    <div
      className={`rounded-xl overflow-hidden bg-white shadow-md border border-green-50/50 flex flex-col ${className}`}
    >
      {/* 박스 헤더 (빨강 or 네이비) */}
      <div
        className={`py-3 text-center ${
          isLeader ? "bg-brand-main" : "bg-[#152a4e]"
        }`}
      >
        <h3 className="text-xl font-black text-white tracking-widest">
          {title}
        </h3>
      </div>

      {/* 박스 바디 (멤버 리스트) */}
      <div className="p-5 flex-1 flex items-center justify-center">
        <div
          className={`w-full grid ${gridCols} gap-y-6 gap-x-2 place-items-center`}
        >
          {members.map((aff) => (
            <div
              key={aff.id}
              className="text-center flex flex-col items-center w-full"
            >
              <div className="flex items-baseline justify-center gap-1 w-full">
                <span className="text-[17px] font-extrabold text-slate-900 tracking-wide">
                  {aff.member.name}
                </span>
                {/* 만약 Affiliation이나 Position에 국장/차장 등 세부 직책(role) 정보가 있다면 여기에 노출 */}
                {/* <span className="text-[11px] font-bold text-[#f58220]">{aff.role}</span> */}
              </div>
              {aff.member.phone && (
                <span className="text-[11px] font-semibold text-slate-500 mt-0.5 tracking-wider">
                  {aff.member.phone}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
