"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Card, CardContent } from "@/components/ui/card";
import { PlusCircle, Check } from "lucide-react";
import { joinOrganizationAction } from "../admin/user-actions";

interface Props {
  organizations: any[]; // DB에서 가져온 전체 목록
}

export function JoinOrgDrawer({ organizations }: Props) {
  const [open, setOpen] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState<number | null>(null);

  const handleSelectGeneration = async (genId: number) => {
    if (!selectedOrgId) return;

    if (confirm("이 소속으로 가입 신청하시겠습니까?")) {
      const result = await joinOrganizationAction(selectedOrgId, genId);
      alert(result.message);
      if (result.success) {
        setOpen(false);
        setSelectedOrgId(null);
      }
    }
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        {/* 대시보드에 들어갈 '추가하기' 카드 디자인 */}
        <Card className="border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors flex items-center justify-center min-h-[200px]">
          <div className="flex flex-col items-center gap-2 text-slate-500">
            <PlusCircle className="w-10 h-10" />
            <span className="font-semibold">새로운 소속 추가하기</span>
          </div>
        </Card>
      </DrawerTrigger>

      <DrawerContent className="h-[80vh]">
        <DrawerHeader>
          <DrawerTitle>추가할 소속을 선택하세요</DrawerTitle>
        </DrawerHeader>

        <div className="p-4 h-full overflow-y-auto pb-20">
          <div className="space-y-4">
            {organizations.map((org) => (
              <div key={org.id} className="space-y-2">
                <div
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedOrgId === org.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-slate-200"
                  }`}
                  onClick={() =>
                    setSelectedOrgId(selectedOrgId === org.id ? null : org.id)
                  }
                >
                  <div className="font-bold text-lg">{org.name}</div>
                </div>

                {/* 해당 소속을 눌렀을 때만 기수 목록이 펼쳐짐 */}
                {selectedOrgId === org.id && (
                  <div className="grid grid-cols-2 gap-2 pl-4 animate-in slide-in-from-top-2 fade-in">
                    {org.generations.map((gen: any) => (
                      <Button
                        key={gen.id}
                        variant="outline"
                        onClick={() => handleSelectGeneration(gen.id)}
                        className="justify-between"
                      >
                        {gen.name}
                        <Check className="w-4 h-4 text-slate-300" />
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
