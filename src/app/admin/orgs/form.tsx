"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createGenerationAction,
  createOrganizationAction,
  deleteGenerationAction,
  deleteOrganizationAction,
} from "@/actions/org-action";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function DeleteButton({
  id,
  type,
}: {
  id: number;
  type: "org" | "gen";
}) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true); // 로딩 상태 시작
    const action =
      type === "org" ? deleteOrganizationAction : deleteGenerationAction;

    try {
      const result = await action(id);
      if (result.success) {
        // 성공 시 별도 알림 없이 UI가 리프레시됨 (Server Action 덕분)
      } else {
        alert(result.message);
      }
    } catch (e) {
      alert("삭제 중 오류가 발생했습니다.");
    } finally {
      setIsDeleting(false);
    }
  };

  const label = type === "org" ? "단체" : "기수";

  return (
    <AlertDialog>
      {/* 1. 트리거: 휴지통 아이콘 버튼 */}
      <AlertDialogTrigger asChild>
        <button
          className="text-gray-400 hover:text-red-600 transition-colors p-1 rounded hover:bg-red-50"
          title={`${label} 삭제`}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </AlertDialogTrigger>

      {/* 2. 경고창 내용 */}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-red-600">
            정말 {label}를 삭제하시겠습니까?
          </AlertDialogTitle>
          <AlertDialogDescription>
            이 작업은 해당 {label}를 목록에서 숨김 처리합니다.
            <br />
            기존에 가입된 회원의 데이터는 보존되지만,
            <br />
            <strong>
              신규 회원은 더 이상 이 {label}를 선택할 수 없습니다.
            </strong>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          {/* 취소 버튼 */}
          <AlertDialogCancel>취소</AlertDialogCancel>

          {/* 확인(삭제) 버튼 - 빨간색 스타일 적용 */}
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            disabled={isDeleting}
          >
            {isDeleting ? "삭제 중..." : "네, 삭제합니다"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
// 1. 소속 추가 폼
export function CreateOrgForm() {
  const ref = useRef<HTMLFormElement>(null);

  const handleSubmit = async (formData: FormData) => {
    // 서버 액션 호출 및 결과 받기
    const result = await createOrganizationAction(formData);

    if (result.success) {
      alert(result.message); // "추가되었습니다."
      ref.current?.reset(); // 입력창 비우기
    } else {
      alert(result.message); // "이미 존재하는..."
    }
  };

  return (
    <form ref={ref} action={handleSubmit} className="flex gap-2">
      <Input name="name" placeholder="예: 대구 정치 연수원" required />
      <Button type="submit">단체 추가</Button>
    </form>
  );
}

// 2. 기수 추가 폼
export function CreateGenForm({ orgId }: { orgId: number }) {
  const ref = useRef<HTMLFormElement>(null);

  const handleSubmit = async (formData: FormData) => {
    const result = await createGenerationAction(formData);

    if (result.success) {
      alert(result.message);
      ref.current?.reset();
    } else {
      alert(result.message);
    }
  };

  return (
    <form ref={ref} action={handleSubmit} className="flex gap-2 items-center">
      <input type="hidden" name="orgId" value={orgId} />
      <Input
        name="name"
        placeholder="예: 3기"
        className="h-9 text-sm"
        required
      />
      <Button type="submit" size="sm" variant="outline">
        기수 추가
      </Button>
    </form>
  );
}
