// src/components/auth/OrgGenerationDrawer.tsx
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { ChevronRight, Check } from "lucide-react";

export function OrgGenerationDrawer({
  organizations,
  onSelect,
}: {
  organizations: any[];
  onSelect: (orgId: number, genId: number, label: string) => void;
}) {
  const [step, setStep] = React.useState(1); // 1: 단체선택, 2: 기수선택
  const [selectedOrg, setSelectedOrg] = React.useState<any>(null);
  const [open, setOpen] = React.useState(false);

  const handleOrgSelect = (org: any) => {
    setSelectedOrg(org);
    setStep(2);
  };

  const handleGenSelect = (gen: any) => {
    onSelect(selectedOrg.id, gen.id, `${selectedOrg.name} ${gen.name}`);
    setOpen(false); // 선택 완료 후 닫기
    setStep(1); // 초기화
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline" className="w-full h-12 justify-between">
          <span>소속 선택</span>
          <ChevronRight className="h-4 w-4 opacity-50" />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="max-h-[80vh]">
        <DrawerHeader>
          <DrawerTitle>
            {step === 1
              ? "소속 단체를 선택하세요"
              : `${selectedOrg?.name} 기수 선택`}
          </DrawerTitle>
        </DrawerHeader>

        <div className="p-4 space-y-2 overflow-y-auto">
          {step === 1
            ? // 1단계: 단체 리스트
              organizations.map((org) => (
                <Button
                  key={org.id}
                  variant="ghost"
                  className="w-full h-14 justify-between text-base border-b"
                  onClick={() => handleOrgSelect(org)}
                >
                  {org.name}
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ))
            : // 2단계: 기수 리스트
              selectedOrg?.generations.map((gen: any) => (
                <Button
                  key={gen.id}
                  variant="ghost"
                  className="w-full h-14 justify-start text-base border-b"
                  onClick={() => handleGenSelect(gen)}
                >
                  {gen.name}
                </Button>
              ))}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
