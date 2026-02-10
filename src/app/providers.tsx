"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  // 리액트 쿼리 클라이언트는 컴포넌트 생명주기 내에서 한 번만 생성되도록 useState로 감쌉니다.
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // 윈도우 포커스시 자동 재요청 방지 (상황에 따라 켜도 됨)
            refetchOnWindowFocus: false,
            staleTime: 60 * 1000, // 1분간은 캐시된 데이터 사용
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
