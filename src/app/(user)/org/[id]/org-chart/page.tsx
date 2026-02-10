"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Phone, Mail, Award } from "lucide-react";

// ----------------------------------------------------------------------
// 1. 하드코딩 데이터 (나중에 DB에서 가져올 구조)
// ----------------------------------------------------------------------
const ORG_DATA = {
  // 🥇 1. 최상위 리더 (회장)
  leader: {
    name: "김태우",
    position: "제 15대 회장",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
    phone: "010-1234-5678",
    email: "president@org.com",
    message: "소통과 화합으로 하나되는 모임을 만들겠습니다.",
  },

  // 🥈 2. 고문 및 감사 (사이드 임원)
  advisors: [
    { name: "이영희", position: "고문", image: null },
    {
      name: "박철수",
      position: "수석 감사",
      image: "https://randomuser.me/api/portraits/men/44.jpg",
    },
  ],

  // 🥉 3. 실무 임원진 (부회장, 사무국장 등)
  executives: [
    { name: "최민수", position: "수석 부회장", phone: "010-1111-2222" },
    { name: "정수진", position: "여성 부회장", phone: "010-3333-4444" },
    {
      name: "강동원",
      position: "사무국장",
      phone: "010-5555-6666",
      highlight: true,
    }, // 실무 책임자 강조
  ],

  // 🍀 4. 각 부서장 (팀장급)
  departments: [
    { name: "기획부", head: "송중기", position: "기획부장" },
    { name: "홍보부", head: "전지현", position: "홍보부장" },
    { name: "재무부", head: "유재석", position: "재무부장" },
    { name: "대외협력부", head: "김혜수", position: "협력부장" },
    { name: "체육부", head: "손흥민", position: "체육부장" },
  ],
};

// ----------------------------------------------------------------------
// 2. 재사용 카드 컴포넌트
// ----------------------------------------------------------------------
function OrgCard({
  member,
  type = "normal",
}: {
  member: any;
  type?: "leader" | "exec" | "normal";
}) {
  const isLeader = type === "leader";

  return (
    <Card
      className={`relative overflow-hidden transition-all hover:shadow-md border-slate-200 ${
        isLeader ? "border-brand-main border-2 shadow-lg" : ""
      } ${member.highlight ? "border-blue-300 bg-blue-50/50" : "bg-white"}`}
    >
      <CardContent
        className={`flex flex-col items-center p-6 ${
          isLeader ? "py-8" : "py-5"
        }`}
      >
        {/* 직책 뱃지 */}
        <Badge
          className={`mb-3 ${
            isLeader
              ? "bg-brand-main text-white text-md px-3 py-1"
              : member.highlight
              ? "bg-blue-600"
              : "bg-slate-700"
          }`}
        >
          {member.position}
        </Badge>

        {/* 아바타 이미지 */}
        <Avatar
          className={`${
            isLeader ? "w-24 h-24 border-4 border-white shadow-sm" : "w-16 h-16"
          } mb-3`}
        >
          <AvatarImage src={member.image} />
          <AvatarFallback className="bg-slate-100 text-slate-400 font-bold text-lg">
            {member.name[0]}
          </AvatarFallback>
        </Avatar>

        {/* 이름 & 정보 */}
        <h3
          className={`font-bold text-slate-900 ${
            isLeader ? "text-xl" : "text-lg"
          }`}
        >
          {member.name}
        </h3>

        {/* 리더 한마디 (리더일 경우만) */}
        {isLeader && member.message && (
          <p className="text-sm text-slate-500 mt-2 text-center break-keep max-w-[200px]">
            "{member.message}"
          </p>
        )}

        {/* 연락처 아이콘들 */}
        {(member.phone || member.email) && (
          <div className="flex gap-3 mt-4 text-slate-400">
            {member.phone && (
              <a
                href={`tel:${member.phone}`}
                className="hover:text-brand-main transition-colors"
              >
                <Phone className="w-4 h-4" />
              </a>
            )}
            {member.email && (
              <a
                href={`mailto:${member.email}`}
                className="hover:text-brand-main transition-colors"
              >
                <Mail className="w-4 h-4" />
              </a>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ----------------------------------------------------------------------
// 3. 메인 페이지 컴포넌트
// ----------------------------------------------------------------------
export default function OrgChartPage() {
  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* 헤더 섹션 */}
      <div className="bg-white border-b px-6 py-8 text-center mb-8">
        <h1 className="text-2xl font-bold text-slate-900">조직도</h1>
        <p className="text-slate-500 text-sm mt-1">
          우리 단체를 이끌어가는 임원진을 소개합니다.
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-4">
        {/* [Level 1] 회장 (Leader) */}
        <div className="flex flex-col items-center">
          <div className="w-full max-w-sm">
            <OrgCard member={ORG_DATA.leader} type="leader" />
          </div>

          {/* 연결선 (Vertical Line) */}
          <div className="h-10 w-px bg-slate-300 my-2"></div>
        </div>

        {/* [Level 2] 고문 및 감사 (Advisors) */}
        <div className="relative mb-10">
          {/* 수평 연결선 */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-px bg-slate-300 hidden md:block"></div>

          <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto md:mt-6">
            {ORG_DATA.advisors.map((advisor, idx) => (
              <div key={idx} className="relative">
                {/* 모바일용 작은 연결선 */}
                <div className="absolute -top-4 left-1/2 w-px h-4 bg-slate-300 md:hidden"></div>
                <OrgCard member={advisor} />
              </div>
            ))}
          </div>

          {/* 다음 레벨로 가는 연결선 */}
          <div className="flex justify-center mt-4">
            <div className="h-8 w-px bg-slate-300"></div>
          </div>
        </div>

        {/* [Level 3] 실무 임원진 (Executives) */}
        <div className="mb-12">
          <div className="text-center mb-4">
            <span className="bg-slate-200 text-slate-600 text-xs px-2 py-1 rounded-full font-bold">
              집행부
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ORG_DATA.executives.map((exec, idx) => (
              <OrgCard key={idx} member={exec} type="exec" />
            ))}
          </div>
        </div>

        <Separator className="my-10" />

        {/* [Level 4] 부서 조직 (Departments) */}
        <div>
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Award className="w-5 h-5 text-brand-main" />
            부서 및 위원회
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {ORG_DATA.departments.map((dept, idx) => (
              <div
                key={idx}
                className="bg-white border rounded-lg p-4 flex flex-col items-center hover:border-brand-main transition-colors cursor-default"
              >
                <span className="text-sm font-bold text-brand-main mb-1">
                  {dept.name}
                </span>
                <span className="font-bold text-slate-900 text-lg">
                  {dept.head}
                </span>
                <span className="text-xs text-slate-400 mt-1">
                  {dept.position}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
