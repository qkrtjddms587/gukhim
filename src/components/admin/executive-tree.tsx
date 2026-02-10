"use client";

import { Fragment } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

// 타입 정의: 직책 정보 + 해당 직책을 맡은 사람(Member) 정보 포함
interface PositionNode {
  id: number;
  name: string;
  parentId: number | null;
  children?: PositionNode[];
  // 해당 직책을 맡은 사람들 (Affiliation을 통해 가져옴)
  holders: {
    id: number;
    member: {
      name: string;
      image: string | null;
      phone: string;
    };
  }[];
}

// 🌳 재귀 컴포넌트: 직책 카드 하나
function PositionNodeCard({ node }: { node: PositionNode }) {
  return (
    <div className="flex flex-col items-center">
      {/* 1. 직책 카드 */}
      <div className="border border-slate-200 bg-white rounded-xl shadow-sm p-4 w-48 flex flex-col items-center gap-3 relative z-10">
        {/* 직책명 */}
        <Badge className="bg-slate-800 text-white hover:bg-slate-700 mb-1">
          {node.name}
        </Badge>

        {/* 이 직책을 맡은 사람들 리스트 */}
        {node.holders.length > 0 ? (
          node.holders.map((holder) => (
            <div key={holder.id} className="flex flex-col items-center gap-1">
              <Avatar className="w-12 h-12 border-2 border-slate-100">
                <AvatarImage src={holder.member.image || ""} />
                <AvatarFallback className="bg-slate-100 font-bold text-slate-500">
                  {holder.member.name[0]}
                </AvatarFallback>
              </Avatar>
              <span className="font-bold text-sm">{holder.member.name}</span>
            </div>
          ))
        ) : (
          <span className="text-xs text-slate-400 py-2">(공석)</span>
        )}
      </div>

      {/* 2. 자식 직책이 있을 경우 연결선 및 하위 렌더링 */}
      {node.children && node.children.length > 0 && (
        <div className="flex flex-col items-center">
          {/* 수직 연결선 (ㅣ) */}
          <div className="w-px h-6 bg-slate-300"></div>

          {/* 하위 그룹 컨테이너 */}
          <div className="flex gap-8 relative">
            {/* 수평 연결선 (─) : 자식이 2명 이상일 때만 위쪽에 가로 선 필요 */}
            {node.children.length > 1 && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[calc(100%-12rem)] h-px bg-slate-300 -translate-y-[1px]" />
            )}

            {node.children.map((child) => (
              <div
                key={child.id}
                className="flex flex-col items-center relative"
              >
                {/* 자식별 상단 연결선 (ㅗ 모양 만들기) */}
                {node.children!.length > 1 && (
                  <div className="w-px h-6 bg-slate-300 absolute -top-6"></div>
                )}

                <PositionNodeCard node={child} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// 🏗️ 메인 컴포넌트: 데이터를 받아서 트리로 조립
export function ExecutiveOrgChart({
  positions,
  affiliations,
}: {
  positions: any[];
  affiliations: any[];
}) {
  // 1. 데이터 조립: Position에 'holders(담당자)' 배열 추가
  const positionsWithHolders = positions.map((pos) => ({
    ...pos,
    holders: affiliations
      .filter((aff) => aff.positionId === pos.id && aff.status === "ACTIVE")
      .map((aff) => ({ id: aff.id, member: aff.member })),
    children: [], // 초기화
  }));

  // 2. Flat List -> Tree Structure 변환
  const buildTree = () => {
    const map = new Map();
    const roots: PositionNode[] = [];

    positionsWithHolders.forEach((pos) => map.set(pos.id, pos));

    positionsWithHolders.forEach((pos) => {
      if (pos.parentId) {
        const parent = map.get(pos.parentId);
        if (parent) {
          parent.children.push(pos);
        }
      } else {
        roots.push(pos); // 부모가 없으면 최상위 (회장)
      }
    });
    return roots;
  };

  const treeData = buildTree();

  return (
    <div className="overflow-x-auto p-10 bg-slate-50 min-h-[500px] flex justify-center">
      {treeData.map((node) => (
        <PositionNodeCard key={node.id} node={node} />
      ))}
    </div>
  );
}
