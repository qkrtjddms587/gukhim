import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    // 미들웨어에서 로그인 여부를 체크하는 로직
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const path = nextUrl.pathname;

      const isOnLoginPage = path.startsWith("/login");
      const isBootstrap = path.startsWith("/app/bootstrap");

      if (isBootstrap) return true;
      // 1. 로그인 했는데 로그인 페이지로 가려면 -> 메인으로 보냄
      if (isOnLoginPage && isLoggedIn) {
        return Response.redirect(new URL("/", nextUrl));
      }

      // 2. 로그인 안 했는데 메인(보호된 구역)으로 가려면 -> 로그인 페이지로 보냄
      // (이미지, API 등은 middleware.ts의 matcher에서 걸러짐)
      if (!isOnLoginPage && !isLoggedIn) {
        return false; // false를 리턴하면 자동으로 로그인 페이지로 리다이렉트됨
      }

      return true;
    },
  },
  providers: [], // 미들웨어에서는 공급자 로직을 비워둡니다.
} satisfies NextAuthConfig;
