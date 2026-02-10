"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Phone, MapPin, Building, Briefcase, Check, X } from "lucide-react";
import { useState } from "react";
import {
  approveMemberAction,
  rejectMemberAction,
} from "@/actions/admin-action";

export function MemberDetailSheet({
  affiliation,
  children,
}: {
  affiliation: any;
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const { member, organization, generation } = affiliation;

  const handleApprove = async () => {
    if (confirm("승인하시겠습니까?")) {
      await approveMemberAction(affiliation.id);
      setIsOpen(false);
    }
  };

  const handleReject = async () => {
    if (confirm("반려하시겠습니까?")) {
      await rejectMemberAction(affiliation.id);
      setIsOpen(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="overflow-y-auto sm:max-w-md p-5">
        <SheetHeader className="pb-4 border-b">
          <div className="flex flex-col items-center gap-3">
            <Avatar className="w-24 h-24 border-2 border-slate-100 shadow-sm">
              <AvatarImage src={member.image || ""} />
              <AvatarFallback className="text-2xl bg-slate-200">
                {member.name[0]}
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <SheetTitle className="text-2xl font-bold">
                {member.name}
              </SheetTitle>
              <SheetDescription className="text-md font-medium text-brand-main mt-1">
                {organization.name} {generation.name}
              </SheetDescription>
              <div className="mt-2">
                {affiliation.status === "PENDING" && (
                  <Badge
                    variant="outline"
                    className="text-orange-500 border-orange-200"
                  >
                    승인 대기중
                  </Badge>
                )}
                {affiliation.status === "ACTIVE" && (
                  <Badge className="bg-blue-600">활동중</Badge>
                )}
                {affiliation.status === "REJECTED" && (
                  <Badge variant="destructive">반려됨</Badge>
                )}
              </div>
            </div>
          </div>
        </SheetHeader>

        <div className="py-6 space-y-6">
          {/* 연락처 정보 */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
              연락처 정보
            </h4>
            <div className="flex items-center gap-3 text-slate-700">
              <Phone className="w-4 h-4 text-slate-400" />
              <span>{member.phone}</span>
            </div>
            {member.address && (
              <div className="flex items-start gap-3 text-slate-700">
                <MapPin className="w-4 h-4 text-slate-400 mt-1" />
                <span>{member.address}</span>
              </div>
            )}
          </div>

          <Separator />

          {/* 직업 정보 */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
              직업 / 소속
            </h4>
            <div className="flex items-center gap-3 text-slate-700">
              <Building className="w-4 h-4 text-slate-400" />
              <span className="font-medium">
                {member.company || "소속 없음"}
              </span>
            </div>
            <div className="flex items-center gap-3 text-slate-700">
              <Briefcase className="w-4 h-4 text-slate-400" />
              <span>{member.job || "직함 없음"}</span>
            </div>
          </div>

          <Separator />

          {/* 가입 신청 정보 */}
          <div className="space-y-2 bg-slate-50 p-3 rounded-lg text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">신청일</span>
              <span>
                {new Date(affiliation.createdAt).toLocaleDateString()}
              </span>
            </div>
            {affiliation.position && (
              <div className="flex justify-between">
                <span className="text-slate-500">신청 직책</span>
                <span className="font-bold">{affiliation.position}</span>
              </div>
            )}
          </div>
        </div>

        <SheetFooter className="flex-col gap-2 sm:flex-col pt-2">
          {/* 대기 상태일 때만 큰 버튼 노출 */}
          {affiliation.status === "PENDING" && (
            <div className="grid grid-cols-2 gap-3 w-full">
              <Button
                onClick={handleReject}
                variant="outline"
                className="w-full text-red-500 hover:text-red-600 hover:bg-red-50 border-red-100"
              >
                <X className="w-4 h-4 mr-2" /> 반려
              </Button>
              <Button
                onClick={handleApprove}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                <Check className="w-4 h-4 mr-2" /> 승인
              </Button>
            </div>
          )}
          <SheetClose asChild>
            <Button variant="ghost" className="w-full mt-2">
              닫기
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
