import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/PageHeader";
import { CommentsManager } from "@/components/admin/CommentsManager";

export const dynamic = "force-dynamic";

export default async function AdminCommentsPage() {
  const comments = await prisma.comment.findMany({
    orderBy: { createdAt: "desc" },
    include: { file: { select: { id: true, title: true } } },
  });
  const pending = comments.filter((c) => c.isApproved === null).length;

  const rows = comments.map((c) => ({
    id: c.id,
    content: c.content,
    email: c.email,
    isPublic: c.isPublic,
    isApproved: c.isApproved,
    createdAt: c.createdAt.toISOString(),
    file: c.file,
  }));

  return (
    <>
      <PageHeader
        title="Comment Moderation"
        subtitle="Review submissions before they appear on the site."
        pendingCount={pending}
      />
      <div className="p-8">
        <CommentsManager comments={rows} />
      </div>
    </>
  );
}
