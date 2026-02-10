import { Badge } from "@/components/ui/badge";

interface Props {
  status: string; // "PENDING" | "ACTIVE" | "REJECTED"
  position?: string | null; // "회장", "총무" 등 (없으면 null)
  isRegular?: boolean; // 정회원 여부 (날짜 계산 결과)
}

export function MemberStatusBadge({
  status,
  position,
  isRegular = false,
}: Props) {
  // 1. 승인 대기
  if (status === "PENDING") {
    return (
      <Badge variant="outline" className="text-orange-500 border-orange-200">
        승인 대기
      </Badge>
    );
  }

  // 2. 반려됨
  if (status === "REJECTED") {
    return <Badge variant="destructive">반려됨</Badge>;
  }

  // 3. 활동중 (ACTIVE)
  if (status === "ACTIVE") {
    // 🥇 1순위: 직책 있음
    if (position) {
      return (
        <Badge className="bg-slate-800 hover:bg-slate-700 text-white border-transparent">
          {position}
        </Badge>
      );
    }
    // 🥈 2순위: 정회원 (기간 남음)
    if (isRegular) {
      return (
        <Badge className="bg-blue-600 hover:bg-blue-700 border-transparent">
          정회원
        </Badge>
      );
    }
    // 🥉 3순위: 일반회원
    return (
      <Badge variant="secondary" className="text-slate-600 bg-slate-100">
        일반회원
      </Badge>
    );
  }

  // 그 외 (예외 처리)
  return <Badge variant="outline">알 수 없음</Badge>;
}
