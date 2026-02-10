"use client";

import Image from "next/image";

interface GreetingViewerProps {
  title: string;
  content: string;
  imageUrl: string | null;
  presidentName: string;
  presidentRole: string;
}

export function GreetingViewer({
  title,
  content,
  imageUrl,
  presidentName,
  presidentRole,
}: GreetingViewerProps) {
  return (
    <div className="max-w-4xl mx-auto px-5 py-16">
      {/* 1. 상단 제목 영역 */}
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">회장 인사말</h2>
        <div className="w-16 h-1 bg-gray-800 mx-auto"></div>
      </div>

      {/* 2. 메인 컨텐츠 (반응형: 모바일 세로 / PC 가로) */}
      <div className="flex flex-col md:flex-row gap-10 items-start">
        {/* 사진 영역 */}
        <div className="w-full md:w-[300px] flex-shrink-0">
          <div className="aspect-[3/4] relative bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={presidentName}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
                사진 없음
              </div>
            )}
          </div>
          <div className="mt-3 text-center md:text-left">
            <p className="font-bold text-lg text-gray-800">{presidentName}</p>
            <p className="text-sm text-gray-500">{presidentRole}</p>
          </div>
        </div>

        {/* 텍스트 영역 */}
        <div className="flex-1">
          {/* 인사말 제목 */}
          <h3 className="text-2xl font-bold text-gray-800 mb-6 leading-snug">
            {title}
          </h3>

          {/* 본문 (줄바꿈 보존) */}
          <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed whitespace-pre-wrap">
            {content}
          </div>

          {/* 서명 영역 */}
          <div className="mt-12 pt-8 border-t border-gray-100 text-right">
            <p className="text-gray-500 mb-2">
              {new Date().getFullYear()}년 {new Date().getMonth() + 1}월
            </p>
            <div className="inline-flex items-center gap-3">
              <span className="text-lg font-bold text-gray-800">
                {presidentRole} {presidentName}
              </span>
              {/* (선택) 도장 느낌의 텍스트 박스 */}
              {/* <div className="border border-red-500 text-red-500 text-xs px-1 py-2 leading-none font-serif select-none">
                {presidentName.slice(-2) || "인"}
                <br/>인
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
