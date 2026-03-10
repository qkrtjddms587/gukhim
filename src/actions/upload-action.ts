// src/actions/upload-actions.ts
"use server";

import { s3Client } from "@/lib/s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export async function getPresignedUrlAction(
  fileName: string,
  contentType: string,
  prefix: string = "etc" // 🌟 폴더명(prefix)을 파라미터로 받습니다. (기본값 설정)
) {
  try {
    // 한글 및 특수문자 제거
    const safeFileName = fileName.replace(/[^a-zA-Z0-9.]/g, "");

    // 🌟 안전한 경로 생성: 앞뒤의 불필요한 슬래시를 제거해서 경로 꼬임 방지
    const cleanPrefix = prefix.replace(/^\/+|\/+$/g, "");

    // 예: "community/1700000000-photo.jpg" 또는 "profiles/1700000000-avatar.jpg"
    const uniqueFileName = `${cleanPrefix}/${Date.now()}-${safeFileName}`;

    const command = new PutObjectCommand({
      Bucket: process.env.NEXT_PUBLIC_S3_BUCKET,
      Key: uniqueFileName,
      ContentType: contentType,
    });

    // 60초 동안만 유효한 업로드 전용 URL 생성
    const presignedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 60,
    });

    // 업로드 완료 후 DB에 저장할 실제 공개 URL
    const publicUrl = `${process.env.NEXT_PUBLIC_S3_DOMAIN}/${process.env.NEXT_PUBLIC_S3_BUCKET}/${uniqueFileName}`;

    return { success: true, presignedUrl, publicUrl };
  } catch (error) {
    console.error("[PRESIGNED_URL_ERROR]", error);
    return { success: false, error: "업로드 URL 발급에 실패했습니다." };
  }
}
