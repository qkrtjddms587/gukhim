"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export function SearchInput({
  placeholder = "검색...",
}: {
  placeholder?: string;
}) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  // 0.3초 동안 입력이 없으면 실행
  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set("q", term);
    } else {
      params.delete("q");
    }
    replace(`${pathname}?${params.toString()}`);
  }, 300);

  return (
    <div className="relative flex-1">
      <Input
        className="h-10 text-sm bg-slate-50 pl-3 pr-9"
        placeholder={placeholder}
        defaultValue={searchParams.get("q")?.toString()}
        onChange={(e) => handleSearch(e.target.value)}
      />
      <Search className="absolute right-3 top-3 w-4 h-4 text-slate-400" />
    </div>
  );
}
