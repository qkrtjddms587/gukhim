"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, Building, Home, LayoutDashboard, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { useState } from "react";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden"; // 접근성용 (설치 필요 없으면 밑에 설명 참고)

interface AdminNavProps {
  role: string;
  mobile?: boolean;
}

// 메뉴 리스트
const menus = [
  { name: "대시보드", href: "/admin", icon: LayoutDashboard, adminOnly: false },
  {
    name: "회원 승인/관리",
    href: "/admin/members",
    icon: Users,
    adminOnly: false,
  },
  {
    name: "소속 및 기수 관리",
    href: "/admin/orgs",
    icon: Building,
    adminOnly: true,
  },
];

export function AdminNav({ role, mobile = false }: AdminNavProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // 🎨 메뉴 내용 (PC/모바일 공용)
  const NavContent = () => (
    <div className="flex flex-col h-full bg-white">
      <div className="p-6 border-b">
        <h1 className="text-xl font-bold flex items-center gap-2">🛡️ 관리자</h1>
        <p className="text-xs text-gray-500 mt-1">
          {role === "ADMIN" ? "최고 관리자" : "매니저"}
        </p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menus.map((menu) => {
          if (menu.adminOnly && role !== "ADMIN") return null;

          const isActive = pathname === menu.href;

          return (
            <Link
              key={menu.href}
              href={menu.href}
              onClick={() => setOpen(false)} // 클릭 시 닫기
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <menu.icon className="w-5 h-5" />
              {menu.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-lg"
        >
          <Home className="w-5 h-5" />
          메인으로
        </Link>
      </div>
    </div>
  );

  // 📱 모바일: Sheet 사용
  if (mobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="w-6 h-6" />
            <span className="sr-only">메뉴 열기</span>
          </Button>
        </SheetTrigger>

        {/* side="left": 왼쪽에서 나옴 */}
        <SheetContent side="left" className="p-0 w-64 bg-white border-r">
          {/* 접근성 에러 방지용 (화면엔 안 보임) */}
          <SheetTitle className="sr-only">관리자 메뉴</SheetTitle>
          <SheetDescription className="sr-only">
            관리자 페이지 네비게이션입니다.
          </SheetDescription>

          <NavContent />
        </SheetContent>
      </Sheet>
    );
  }

  // 💻 PC: 사이드바 사용
  return (
    <div className="w-64 bg-white border-r h-full hidden md:flex flex-col">
      <NavContent />
    </div>
  );
}
