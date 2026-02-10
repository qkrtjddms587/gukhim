import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config"; // 👈 1단계에서 만든 설정 가져오기

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig, // 👈 기본 설정 병합
  providers: [
    Credentials({
      credentials: {
        loginId: { label: "아이디", type: "text" },
        password: { label: "비밀번호", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.loginId || !credentials?.password) return null;

        const member = await prisma.member.findUnique({
          where: { loginId: String(credentials.loginId) },
        });

        if (!member) return null;

        const isValid = await bcrypt.compare(
          String(credentials.password),
          member.password
        );

        if (!isValid) return null;

        return {
          id: String(member.id),
          name: member.name,
          email: member.loginId,
        };
      },
    }),
  ],
  callbacks: {
    // 세션 관리 (Prisma 사용) - 이 부분은 auth.config.ts에 넣으면 안 됩니다!
    ...authConfig.callbacks, // authorized 콜백 유지
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        const affiliations = await prisma.affiliation.findMany({
          where: { memberId: Number(token.sub) },
          include: { organization: true, generation: true },
        });
        session.user.affiliations = affiliations;
      }
      return session;
    },
    async jwt({ token, user }) {
      // 로그인 시점에 JWT 토큰 생성
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
});
