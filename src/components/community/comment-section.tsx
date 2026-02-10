"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createCommentAction } from "@/actions/post-actions";
import { useRouter } from "next/navigation";

export function CommentSection({ postId, comments, currentUser }: any) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setIsSubmitting(true);

    await createCommentAction(postId, content);

    setContent("");
    setIsSubmitting(false);
    router.refresh(); // 페이지 새로고침 없이 데이터 갱신
  };

  return (
    <div className="space-y-6">
      <h3 className="font-bold text-lg flex items-center gap-2">
        댓글 <span className="text-brand-main">{comments.length}</span>
      </h3>

      {/* 댓글 리스트 */}
      <div className="space-y-4">
        {comments.map((comment: any) => (
          <div
            key={comment.id}
            className="flex gap-3 bg-slate-50 p-4 rounded-xl"
          >
            <Avatar className="w-8 h-8 mt-1">
              <AvatarImage src={comment.member.image} />
              <AvatarFallback className="text-xs">
                {comment.member.name[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-sm text-slate-900">
                  {comment.member.name}
                </span>
                <span className="text-xs text-slate-400">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">
                {comment.content}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* 댓글 입력폼 */}
      <div className="flex gap-3 mt-6">
        <Avatar className="w-8 h-8 hidden md:block">
          <AvatarFallback>{currentUser?.name?.[0] || "?"}</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-2">
          <Textarea
            placeholder={
              currentUser ? "댓글을 남겨보세요." : "로그인이 필요합니다."
            }
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[80px] resize-none bg-white"
            disabled={!currentUser || isSubmitting}
          />
          <div className="flex justify-end">
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={!content.trim() || isSubmitting}
              className="bg-slate-900 hover:bg-slate-800"
            >
              {isSubmitting ? "등록 중..." : "등록하기"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
