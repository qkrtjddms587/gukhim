"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { ImagePlus, Loader2, Edit2, Trash2 } from "lucide-react";
import {
  deleteBannerAction,
  updateBannerAction,
} from "@/actions/banner-actions";
// 🌟 서버 액션 경로 확인 필수! (수정 및 삭제 액션)

interface BannerProps {
  id: number;
  title: string | null;
  imageUrl: string;
  linkUrl: string | null;
  isActive: boolean;
  displayOrder: number;
  startDate: Date | null;
  endDate: Date | null;
}

interface EditBannerDialogProps {
  banner: BannerProps;
  orgId: number;
}

export function EditBannerDialog({ banner, orgId }: EditBannerDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // 상태 관리: 활성 여부 및 이미지 미리보기
  const [isActive, setIsActive] = useState(banner.isActive);
  const [image, setImage] = useState<File | null>(null);
  // 처음엔 기존 이미지 URL을 보여줍니다.
  const [preview, setPreview] = useState<string>(banner.imageUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 날짜 포맷팅 헬퍼 (HTML input type="datetime-local" 용도)
  const formatDateForInput = (date: Date | null) => {
    if (!date) return "";
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);

    try {
      const formData = new FormData(e.currentTarget);
      formData.append("bannerId", banner.id.toString());
      formData.append("isActive", isActive.toString());

      // 새 이미지를 선택한 경우에만 폼 데이터에 추가
      if (image) {
        formData.append("image", image);
      }

      await updateBannerAction(formData);
      setIsOpen(false);
    } catch (error) {
      console.error(error);
      alert("배너 수정에 실패했습니다.");
    } finally {
      setIsPending(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("정말 이 배너를 삭제하시겠습니까?")) return;

    setIsDeleting(true);
    try {
      await deleteBannerAction(banner.id);
      setIsOpen(false);
    } catch (error) {
      console.error(error);
      alert("배너 삭제에 실패했습니다.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {/* 🌟 테이블 셀 안의 아이콘 버튼 */}
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-slate-500 hover:text-brand-main"
        >
          <Edit2 className="w-4 h-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>배너 수정</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* 상태 스위치 */}
          <div className="flex items-center justify-between">
            <Label className="text-base font-medium">배너 활성화</Label>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>

          <div className="space-y-4">
            {/* 이미지 (필수 아님: 변경 안하면 기존 유지) */}
            <div className="space-y-2">
              <Label>배너 이미지 (변경 시 선택)</Label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
              />
              <div
                className="w-full h-32 rounded-md border-2 border-dashed border-slate-300 flex flex-col items-center justify-center cursor-pointer overflow-hidden relative group"
                onClick={() => fileInputRef.current?.click()}
              >
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center transition-all">
                  <p className="text-white text-sm font-medium flex items-center gap-2">
                    <ImagePlus className="w-4 h-4" /> 이미지 변경
                  </p>
                </div>
              </div>
            </div>

            {/* 제목 */}
            <div className="space-y-2">
              <Label>
                제목{" "}
                <span className="text-slate-400 text-xs font-normal">
                  (선택)
                </span>
              </Label>
              <Input
                name="title"
                defaultValue={banner.title || ""}
                placeholder="예: 2026년 상반기 모집"
              />
            </div>

            {/* 연결 링크 */}
            <div className="space-y-2">
              <Label>
                연결 링크{" "}
                <span className="text-slate-400 text-xs font-normal">
                  (선택)
                </span>
              </Label>
              <Input
                name="linkUrl"
                defaultValue={banner.linkUrl || ""}
                placeholder="https://..."
              />
            </div>

            {/* 노출 기간 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>
                  시작 일시{" "}
                  <span className="text-slate-400 text-xs font-normal">
                    (선택)
                  </span>
                </Label>
                <Input
                  type="datetime-local"
                  name="startDate"
                  defaultValue={formatDateForInput(banner.startDate)}
                />
              </div>
              <div className="space-y-2">
                <Label>
                  종료 일시{" "}
                  <span className="text-slate-400 text-xs font-normal">
                    (선택)
                  </span>
                </Label>
                <Input
                  type="datetime-local"
                  name="endDate"
                  defaultValue={formatDateForInput(banner.endDate)}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 justify-between pt-4 border-t">
            {/* 삭제 버튼 추가 */}
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isPending || isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              삭제
            </Button>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
              >
                취소
              </Button>
              <Button
                type="submit"
                className="bg-brand-main"
                disabled={isPending || isDeleting}
              >
                {isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                저장
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
