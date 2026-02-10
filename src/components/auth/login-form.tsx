"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const loginSchema = z.object({
  loginId: z.string().min(1, "아이디를 입력해주세요."),
  password: z.string().min(1, "비밀번호를 입력해주세요."),
});

export function LoginForm() {
  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { loginId: "", password: "" },
  });

  async function onSubmit(data: z.infer<typeof loginSchema>) {
    const result = await signIn("credentials", {
      loginId: data.loginId,
      password: data.password,
      redirect: true,
      callbackUrl: "/",
    });

    // Credentials 방식은 실패 시 에러 URL로 리다이렉트되므로,
    // 클라이언트 측 에러 처리는 주로 URL 파라미터를 확인하거나
    // redirect: false 옵션을 쓸 때 필요합니다.
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 px-4 py-6"
      >
        <FormField
          control={form.control}
          name="loginId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>아이디</FormLabel>
              <FormControl>
                <Input placeholder="아이디" className="h-12" {...field} />
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
                <Input
                  type="password"
                  placeholder="비밀번호"
                  className="h-12"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full h-14 text-lg font-bold mt-6">
          로그인
        </Button>
      </form>
    </Form>
  );
}
