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
        code: { label: "code", type: "text" },
      },
      async authorize(credentials) {
        const code = credentials?.code ? String(credentials.code) : null;
        if (code) {
          const row = await prisma.loginCode.findUnique({ where: { code } });
          if (!row) return null;
          if (row.usedAt) return null;
          if (row.expiresAt < new Date()) return null;

          await prisma.loginCode.update({
            where: { code },
            data: { usedAt: new Date() },
          });

          const member = await prisma.member.findUnique({
            where: { id: row.memberId },
          });
          if (!member) return null;

          return {
            id: String(member.id),
            name: member.name,
            email: member.loginId,
          };
        }

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
    ...authConfig.callbacks,

    async jwt({ token, user }) {
      if (user) token.sub = (user as any).id;
      return token;
    },

    async session({ session, token }) {
      if (session.user && token.sub) {
        (session.user as any).id = token.sub;

        // 너가 기존에 affiliations 붙이던 부분(예시 유지)
        // 필요 없으면 제거/수정
        const affiliations = await prisma.affiliation
          ?.findMany?.({
            where: { memberId: Number(token.sub) },
            include: { organization: true, generation: true },
          })
          .catch(() => null);

        if (affiliations) (session.user as any).affiliations = affiliations;
      }
      return session;
    },
  },
});
