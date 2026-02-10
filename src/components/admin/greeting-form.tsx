"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { updateGreeting } from "@/actions/admin-action";

interface GreetingFormProps {
  affiliationId: number;
  initialData?: any;
}

export function GreetingForm({
  affiliationId,
  initialData,
}: GreetingFormProps) {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    const result = await updateGreeting(affiliationId, formData);
    setLoading(false);

    if (result.success) toast.success("인사말이 저장되었습니다.");
    else toast.error("저장에 실패했습니다.");
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">인사말 제목</Label>
        <Input
          id="title"
          name="title"
          defaultValue={initialData?.title || ""}
          placeholder="예: 회원 여러분께 드리는 글"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">인사말 본문</Label>
        <Textarea
          id="content"
          name="content"
          className="h-48 leading-relaxed"
          defaultValue={initialData?.content || ""}
          placeholder="디자인에 맞춰 줄바꿈(Enter)을 활용해 작성하세요."
          maxLength={1000}
          required
        />
        <p className="text-xs text-muted-foreground text-right">
          최대 1000자까지 입력 가능합니다.
        </p>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "저장 중..." : "인사말 적용하기"}
      </Button>
    </form>
  );
}
