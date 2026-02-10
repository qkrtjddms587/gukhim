import NextAuth, { DefaultSession } from "next-auth";

// NextAuth의 Session과 User 타입을 확장(Augmentation)합니다.
declare module "next-auth" {
  /**
   * 세션(Session) 객체에 커스텀 필드 추가
   */
  interface Session {
    user: {
      id: string;
      // 우리가 추가한 affiliations 필드 정의 (복잡하면 일단 any[]로 퉁치고, 나중에 구체화 가능)
      affiliations: any[];
    } & DefaultSession["user"];
  }

  /**
   * JWT 토큰에도 커스텀 필드 추가 (필요 시)
   */
  interface User {
    affiliations?: any[];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    affiliations?: any[];
  }
}
