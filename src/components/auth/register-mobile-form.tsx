"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge"; // 뱃지 컴포넌트 필요
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { OrgGenerationDrawer } from "./OrgGenerationDrawer";

import { X, Plus } from "lucide-react";
import { registerMemberAction } from "@/actions/auth-action";

// 스키마 업데이트
const registerSchema = z.object({
  loginId: z.string().min(4, "아이디는 4글자 이상이어야 합니다."),
  password: z.string().min(6, "비밀번호는 6글자 이상이어야 합니다."),
  name: z.string().min(2, "이름은 2글자 이상이어야 합니다."),
  phone: z.string().regex(/^010-\d{4}-\d{4}$/, "형식이 올바르지 않습니다."),
  // 배열 유효성 검사
  affiliations: z
    .array(
      z.object({
        orgId: z.number(),
        genId: z.number(),
        label: z.string(), // UI 표시용
      })
    )
    .min(1, "최소 하나의 소속을 추가해주세요."),
});

const formatPhoneNumber = (value: string) => {
  // 숫자만 남기기
  const numbers = value.replace(/[^\d]/g, "");

  // 010-1234-5678 포맷 만들기
  if (numbers.length <= 3) return numbers;
  if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
  return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(
    7,
    11
  )}`;
};

export function RegisterMobileForm({
  organizations,
}: {
  organizations: any[];
}) {
  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      loginId: "",
      password: "",
      name: "",
      phone: "",
      affiliations: [], // 빈 배열로 시작
    },
  });

  // 현재 선택된 목록 (watch로 실시간 감지)
  const selectedAffiliations = form.watch("affiliations");

  const handleAddAffiliation = (
    orgId: number,
    genId: number,
    label: string
  ) => {
    // 중복 체크
    const exists = selectedAffiliations.some(
      (a) => a.orgId === orgId && a.genId === genId
    );
    if (exists) {
      alert("이미 선택한 소속입니다.");
      return;
    }

    // 배열에 추가
    const current = form.getValues("affiliations");
    form.setValue("affiliations", [...current, { orgId, genId, label }]);
  };

  const handleRemoveAffiliation = (index: number) => {
    const current = form.getValues("affiliations");
    form.setValue(
      "affiliations",
      current.filter((_, i) => i !== index)
    );
  };

  const onSubmit = async (data: z.infer<typeof registerSchema>) => {
    const result = await registerMemberAction(data);
    if (result.success) {
      alert(result.message);
      window.location.reload();
    } else {
      alert(result.message);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 px-4 py-6"
      >
        {/* 기본 정보 필드들 (아이디/비번/이름/폰) */}
        <FormField
          control={form.control}
          name="loginId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>아이디</FormLabel>
              <FormControl>
                <Input {...field} className="h-12" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>비밀번호</FormLabel>
              <FormControl>
                <Input type="password" {...field} className="h-12" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>이름</FormLabel>
              <FormControl>
                <Input {...field} className="h-12" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>전화번호</FormLabel>
              <FormControl>
                <Input
                  type="tel"
                  placeholder="010-0000-0000"
                  className="h-12"
                  {...field}
                  // ✨ 핵심: 입력할 때마다 포맷팅 함수를 거쳐서 값을 넣어줌
                  onChange={(e) => {
                    const formatted = formatPhoneNumber(e.target.value);
                    // 최대 길이 제한 (하이픈 포함 13자리)
                    if (formatted.length <= 13) {
                      field.onChange(formatted);
                    }
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* ✅ 다중 소속 선택 영역 */}
        <div className="space-y-3 pt-2">
          <FormLabel>소속 (여러 개 선택 가능)</FormLabel>

          {/* 선택된 소속 태그 리스트 */}
          <div className="flex flex-wrap gap-2 mb-2">
            {selectedAffiliations.map((aff, index) => (
              <Badge
                key={`${aff.orgId}-${aff.genId}`}
                variant="secondary"
                className="h-8 px-3 text-sm flex items-center gap-1 bg-slate-200 hover:bg-slate-300"
              >
                {aff.label}
                <button
                  type="button"
                  onClick={() => handleRemoveAffiliation(index)}
                >
                  <X className="w-3 h-3 text-slate-500 hover:text-red-500" />
                </button>
              </Badge>
            ))}
          </div>

          {/* 소속 추가 버튼 (Drawer) */}
          <OrgGenerationDrawer
            organizations={organizations}
            onSelect={handleAddAffiliation} // 선택 시 배열에 추가 함수 실행
          />

          {/* 에러 메시지 (선택 안 했을 때) */}
          {form.formState.errors.affiliations && (
            <p className="text-sm font-medium text-destructive">
              {form.formState.errors.affiliations.message}
            </p>
          )}
        </div>

        <Button type="submit" className="w-full h-14 mt-8 text-lg font-bold">
          가입 신청하기
        </Button>
      </form>
    </Form>
  );
}
