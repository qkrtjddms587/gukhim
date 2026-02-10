"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// 1. 게시글 작성
export async function createPostAction(formData: FormData, orgId: number) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const type = (formData.get("type") as string) || "FREE"; // NOTICE or FREE

  if (!title || !content) return { error: "제목과 내용을 입력해주세요." };

  const post = await prisma.post.create({
    data: {
      title,
      content,
      type,
      authorId: Number(session.user.id),
      organizationId: orgId,
    },
  });

  revalidatePath(`/org/${orgId}/community`);
  redirect(`/org/${orgId}/community/${post.id}`);
}

// 2. 댓글 작성
export async function createCommentAction(postId: number, content: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("로그인이 필요합니다.");

  await prisma.comment.create({
    data: {
      content,
      postId,
      memberId: Number(session.user.id),
    },
  });

  // 페이지 갱신 (경로는 호출하는 쪽에서 revalidatePath를 쓰거나, 여기서 동적으로 처리)
  revalidatePath(`/org/[id]/community/${postId}`, "page");
}
