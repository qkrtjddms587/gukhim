"use client";

import { usePathname } from "next/navigation";

export default function MainContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // ✅ 정규식 체크: "/org/숫자" 형식과 정확히 일치할 때만 true
  // (예: /org/1 -> true, /org/1/community -> false)
  const isOrgMain = /^\/org\/\d+$/.test(pathname || "");

  return (
    <main className={`${isOrgMain ? "pt-0" : "pt-16"} pb-16 min-h-screen`}>
      {children}
    </main>
  );
}
