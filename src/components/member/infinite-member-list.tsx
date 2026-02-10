"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";
import { getMembersAction } from "@/actions/member-actions";
import { MemberCard } from "./member-card";
import { Loader2 } from "lucide-react";

interface Props {
  initialData: any; // 서버에서 받아온 1페이지 데이터
  orgId: number;
  searchQuery: string;
  generationId: string;
}

export function InfiniteMemberList({
  initialData,
  orgId,
  searchQuery,
  generationId,
}: Props) {
  const { ref, inView } = useInView();

  const {
    data, // 로드된 모든 페이지 데이터
    fetchNextPage, // 다음 페이지 불러오는 함수
    hasNextPage, // 다음 페이지 있는지 여부
    isFetchingNextPage, // 로딩 상태
  } = useInfiniteQuery({
    // 🔑 queryKey: 이 키 배열이 바뀌면(예: 검색어 변경) 자동으로 리스트가 초기화되고 새로 fetch 함
    queryKey: ["members", orgId, searchQuery, generationId],

    // 실제 데이터를 가져오는 함수
    queryFn: ({ pageParam = 1 }) =>
      getMembersAction({
        orgId,
        query: searchQuery,
        generationId,
        page: pageParam as number,
      }),

    // 다음 페이지 번호를 결정하는 로직 (backend response의 nextId 활용)
    getNextPageParam: (lastPage) => lastPage.nextId ?? undefined,

    // 시작 페이지 번호
    initialPageParam: 1,

    // 🔥 핵심: SSR로 가져온 첫 페이지 데이터를 초기값으로 설정 (깜빡임 없음!)
    initialData: {
      pages: [initialData],
      pageParams: [1],
    },
  });

  // 스크롤이 바닥(ref)에 닿으면 다음 페이지 호출
  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  // React Query 데이터는 pages 배열 안에 data가 들어있는 구조라 평탄화(flatMap) 필요
  const allMembers = data?.pages.flatMap((page) => page.data) || [];

  return (
    <div className="space-y-3 pb-4">
      {allMembers.map((aff) => (
        <MemberCard
          key={aff.id}
          name={aff.member.name}
          role={aff.position || (aff.role === "ADMIN" ? "관리자" : undefined)}
          company={aff.member.company || ""}
          job={aff.member.job || ""}
          address={aff.member.address || ""}
          phone={aff.member.phone}
          generation={aff.generation.name}
          imageUrl={aff.member.id || undefined}
        />
      ))}

      {/* 로딩 인디케이터 & 감지 센서 */}
      <div ref={ref} className="flex justify-center p-4 min-h-[50px]">
        {isFetchingNextPage ? (
          <Loader2 className="w-6 h-6 animate-spin text-brand-main" />
        ) : hasNextPage ? (
          <div className="h-1" /> // 투명한 감지 영역
        ) : (
          allMembers.length > 0 && (
            <p className="text-xs text-slate-400">마지막 목록입니다.</p>
          )
        )}

        {allMembers.length === 0 && (
          <p className="text-slate-400 py-10">검색 결과가 없습니다.</p>
        )}
      </div>
    </div>
  );
}
