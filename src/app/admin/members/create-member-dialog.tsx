"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createMemberByAdminAction } from "@/actions/admin-create-user";
import { Plus } from "lucide-react";
import { toast } from "sonner"; // 혹은 alert 사용

// 부모에게서 받을 데이터 타입
interface Props {
  organizations: {
    id: number;
    name: string;
    generations: { id: number; name: string }[];
  }[];
}

export function CreateMemberDialog({ organizations }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    loginId: "",
    name: "",
    phone: "",
    organizationId: "",
    generationId: "",
    position: "",
    company: "",
    job: "",
  });

  // 선택된 단체에 맞는 기수 목록 찾기
  const selectedOrg = organizations.find(
    (o) => String(o.id) === formData.organizationId
  );
  const generations = selectedOrg?.generations || [];

  const handleSubmit = async () => {
    if (
      !formData.name ||
      !formData.phone ||
      !formData.organizationId ||
      !formData.generationId
    ) {
      alert("필수 항목(이름, 전화번호, 소속, 기수)을 입력해주세요.");
      return;
    }

    setLoading(true);
    const result = await createMemberByAdminAction(formData);
    setLoading(false);

    if (result.success) {
      alert("등록되었습니다! 초기 비밀번호는 전화번호(숫자만)입니다.");
      setOpen(false);
      setFormData({
        loginId: "",
        name: "",
        phone: "",
        organizationId: "",
        generationId: "",
        position: "",
        company: "",
        job: "",
      }); // 초기화
    } else {
      alert(result.message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-brand-main hover:bg-brand-main/90">
          <Plus className="w-4 h-4" /> 회원 직접 등록
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>새 회원 등록</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* 소속 선택 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>
                단체 선택 <span className="text-red-500">*</span>
              </Label>
              <Select
                onValueChange={(val) =>
                  setFormData({
                    ...formData,
                    organizationId: val,
                    generationId: "",
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="단체" />
                </SelectTrigger>
                <SelectContent>
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={String(org.id)}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>
                기수 선택 <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.generationId}
                onValueChange={(val) =>
                  setFormData({ ...formData, generationId: val })
                }
                disabled={!formData.organizationId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="기수" />
                </SelectTrigger>
                <SelectContent>
                  {generations.map((gen) => (
                    <SelectItem key={gen.id} value={String(gen.id)}>
                      {gen.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>
              로그인 아이디 <span className="text-red-500">*</span>
            </Label>
            <Input
              placeholder="예: user1234"
              value={formData.loginId}
              onChange={(e) =>
                setFormData({ ...formData, loginId: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>
              이름 <span className="text-red-500">*</span>
            </Label>
            <Input
              placeholder="홍길동"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>
              전화번호 <span className="text-red-500">*</span>
            </Label>
            <Input
              placeholder="010-1234-5678"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
            />
            <p className="text-xs text-slate-400">
              초기 비밀번호는 전화번호 숫자(하이픈 제외)로 설정됩니다.
            </p>
          </div>

          <div className="space-y-2">
            <Label>직함 (모임 내 역할)</Label>
            <Input
              placeholder="예: 사무국장"
              value={formData.position}
              onChange={(e) =>
                setFormData({ ...formData, position: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>회사명</Label>
              <Input
                value={formData.company}
                onChange={(e) =>
                  setFormData({ ...formData, company: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>직종</Label>
              <Input
                value={formData.job}
                onChange={(e) =>
                  setFormData({ ...formData, job: e.target.value })
                }
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "등록 중..." : "등록하기"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
