import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    // 쿼리 로그를 보고 싶으면 아래 주석을 해제하세요
    // log: ['query'],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
