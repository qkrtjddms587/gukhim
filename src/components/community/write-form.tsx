"use client";

import { useState } from "react";
import { createPostAction } from "@/actions/post-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BackButton } from "@/components/common/back-button";
import { Link as LinkIcon, X, Loader2, Plus } from "lucide-react";

// 🌟 최대 입력 가능한 URL 개수 설정
const MAX_IMAGES = 5;

interface WriteFormProps {
  orgId: number;
  isAdmin: boolean;
}

export function WriteForm({ orgId, isAdmin }: WriteFormProps) {
  const [isPending, setIsPending] = useState(false);

  // 🌟 여러 개의 URL을 담을 배열 상태와, 현재 입력 중인 URL 상태를 나눕니다.
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [currentUrl, setCurrentUrl] = useState("");

  // URL 추가 핸들러
  const handleAddUrl = () => {
    if (!currentUrl.trim()) return; // 빈 값이면 무시

    if (imageUrls.length >= MAX_IMAGES) {
      alert(`이미지는 최대 ${MAX_IMAGES}장까지만 추가할 수 있습니다.`);
      return;
    }

    setImageUrls((prev) => [...prev, currentUrl]);
    setCurrentUrl(""); // 입력창 비우기
  };

  // URL 삭제 핸들러
  const handleRemoveUrl = (indexToRemove: number) => {
    setImageUrls((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // 엔터 키를 누르면 폼이 제출되지 않고 URL만 추가되도록 방어
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddUrl();
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);

    try {
      const formData = new FormData(e.currentTarget);

      // 🌟 배열에 모인 URL들을 'imageUrls'라는 동일한 키값으로 FormData에 집어넣습니다.
      imageUrls.forEach((url) => {
        formData.append("imageUrls", url);
      });

      await createPostAction(formData, orgId);
    } catch (error) {
      console.error(error);
      alert("게시글 등록에 실패했습니다.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="w-[140px]">
        <Select name="type" defaultValue="FREE">
          <SelectTrigger>
            <SelectValue placeholder="분류" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="FREE">자유게시판</SelectItem>
            {isAdmin && <SelectItem value="GALLERY">갤러리게시판</SelectItem>}
            {isAdmin && (
              <SelectItem value="ADS">우리 동네 홍보 게시판</SelectItem>
            )}
            {isAdmin && <SelectItem value="NOTICE">공지사항</SelectItem>}
          </SelectContent>
        </Select>
      </div>

      <Input
        name="title"
        placeholder="제목을 입력하세요"
        required
        className="text-lg py-6"
      />

      <Textarea
        name="content"
        placeholder="내용을 입력하세요. 서로를 배려하는 고운 말을 사용해주세요."
        required
        className="min-h-[300px] resize-none text-base leading-relaxed p-4"
      />

      {/* 🌟 다중 이미지 URL 입력 영역 */}
      <div className="space-y-4 pt-2 border-t">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-slate-700">
            이미지 첨부 ({imageUrls.length}/{MAX_IMAGES})
          </span>
        </div>

        {/* URL 입력창과 추가 버튼 */}
        {imageUrls.length < MAX_IMAGES && (
          <div className="flex gap-2">
            <div className="relative flex-1">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                value={currentUrl}
                onChange={(e) => setCurrentUrl(e.target.value)}
                onKeyDown={handleInputKeyDown}
                placeholder="이미지 URL을 입력하고 추가 버튼을 누르세요"
                className="pl-9 bg-slate-50"
              />
            </div>
            <Button
              type="button"
              onClick={handleAddUrl}
              variant="secondary"
              className="shrink-0"
            >
              <Plus className="w-4 h-4 mr-1" /> 추가
            </Button>
          </div>
        )}

        {/* 추가된 이미지 미리보기 목록 */}
        {imageUrls.length > 0 && (
          <div className="flex flex-wrap gap-3 mt-4">
            {imageUrls.map((url, idx) => (
              <div key={idx} className="relative inline-block group">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-md overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center">
                  <img
                    src={url}
                    alt={`미리보기 ${idx + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://via.placeholder.com/150?text=Invalid+URL";
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveUrl(idx)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-sm hover:bg-red-600 transition"
                  aria-label="이미지 삭제"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-2 justify-end pt-4 border-t mt-8">
        <BackButton />
        <Button
          type="submit"
          disabled={isPending}
          className="bg-brand-main hover:bg-brand-main/90 w-24"
        >
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "등록"}
        </Button>
      </div>
    </form>
  );
}
