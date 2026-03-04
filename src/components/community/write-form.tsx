"use client";

import { useState, useRef } from "react";
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
import { ImagePlus, X, Loader2 } from "lucide-react";

// 🌟 마법의 변수: 나중에 다중 업로드로 바꾸고 싶다면 이 숫자만 3, 5, 10 등으로 바꾸시면 됩니다!
const MAX_IMAGES = 1;

interface WriteFormProps {
  orgId: number;
  isAdmin: boolean;
}

export function WriteForm({ orgId, isAdmin }: WriteFormProps) {
  const [isPending, setIsPending] = useState(false);

  // MAX_IMAGES에 대응하기 위해 상태를 다시 배열로 관리합니다.
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 이미지 선택 핸들러
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // 🌟 1. 남은 등록 가능 갯수 계산
    const availableSpace = MAX_IMAGES - images.length;

    // 선택한 파일이 허용치보다 많으면 잘라냅니다.
    const filesToAdd = files.slice(0, availableSpace);

    if (files.length > availableSpace) {
      alert(`이미지는 최대 ${MAX_IMAGES}장까지만 첨부할 수 있습니다.`);
    }

    setImages((prev) => [...prev, ...filesToAdd]);

    // 미리보기 URL 생성
    const newPreviews = filesToAdd.map((file) => URL.createObjectURL(file));
    setPreviews((prev) => [...prev, ...newPreviews]);

    // 같은 파일 다시 선택할 수 있도록 input 초기화
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // 이미지 삭제 핸들러
  const handleRemoveImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    setPreviews((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // 폼 제출 핸들러
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);

    try {
      const formData = new FormData(e.currentTarget);

      // 🌟 2. 이미지가 몇 장이든 일관되게 'images' 라는 키값으로 배열처럼 전송
      images.forEach((image) => {
        formData.append("images", image);
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

      {/* 이미지 업로드 영역 */}
      <div className="space-y-4 pt-2">
        {/* 숨겨진 파일 입력창 (MAX_IMAGES가 1보다 크면 자동으로 multiple 속성 부여) */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageChange}
          accept="image/*"
          multiple={MAX_IMAGES > 1}
          className="hidden"
        />

        {/* 🌟 3. 현재 등록된 이미지가 MAX_IMAGES보다 적을 때만 첨부 버튼 노출 */}
        {images.length < MAX_IMAGES && (
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2"
          >
            <ImagePlus className="w-4 h-4" />
            사진 첨부 {MAX_IMAGES > 1 ? `(${images.length}/${MAX_IMAGES})` : ""}
          </Button>
        )}

        {/* 미리보기 영역 */}
        {previews.length > 0 && (
          <div className="flex flex-wrap gap-3 mt-2">
            {previews.map((preview, idx) => (
              <div key={idx} className="relative inline-block">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-md overflow-hidden border border-slate-200">
                  <img
                    src={preview}
                    alt={`Preview ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveImage(idx)}
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

      <div className="flex gap-2 justify-end pt-4 border-t">
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
