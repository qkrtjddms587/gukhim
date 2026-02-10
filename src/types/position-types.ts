// src/types/position-types.ts

export const DuesCycleMap = {
  NONE: "없음 (무료)",
  MONTHLY: "매월",
  QUARTERLY: "분기 (3개월)", // 👈 추가됨
  YEARLY: "매년",
} as const;

// 위 객체의 키(Key)들만 뽑아서 타입으로 만듦
export type DuesCycleType = keyof typeof DuesCycleMap;
