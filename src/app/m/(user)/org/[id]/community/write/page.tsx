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
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { BackButton } from "@/components/common/back-button";
import { WriteForm } from "@/components/community/write-form";
import { isOrgAdmin } from "@/lib/auth/auth-utils";

export default async function WritePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const orgId = Number(id);
  const session = await auth();

  const isAdmin = isOrgAdmin(session?.user, orgId);

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8">
      <div>
        <h1 className="text-2xl font-bold mb-6">글쓰기</h1>
        <BackButton />
      </div>
      <WriteForm orgId={orgId} isAdmin={isAdmin} />
    </div>
  );
}
