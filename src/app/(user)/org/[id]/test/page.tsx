import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminPushForm } from "@/components/admin/admin-push-form";
import { BellRing } from "lucide-react";
import { isOrgAdmin } from "@/lib/auth/auth-utils";

export default async function AdminPushPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const orgId = Number(id);
  const session = await auth();

  // 1. 비로그인 접근 차단
  if (!session?.user) {
    redirect("/login");
  }

  // 2. 🌟 최고 보안: 해당 단체의 관리자(ADMIN)가 아니면 메인으로 강제 추방
  if (!isOrgAdmin(session.user, orgId)) {
    redirect(`/m/org/${orgId}`);
  }

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8 min-h-screen bg-white shadow-sm md:my-6 md:rounded-xl md:border">
      <div className="mb-8 pb-4 border-b border-slate-100 flex items-center gap-3">
        <div className="w-10 h-10 bg-brand-main/10 rounded-full flex items-center justify-center">
          <BellRing className="w-5 h-5 text-brand-main" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            전체 푸시 알림 발송
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            단체 회원들에게 공지사항을 앱 푸시로 전송합니다.
          </p>
        </div>
      </div>

      {/* 🌟 클라이언트 폼 렌더링 */}
      <AdminPushForm orgId={orgId} />
    </div>
  );
}
