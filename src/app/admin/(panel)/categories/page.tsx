import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/PageHeader";
import { CategoriesManager } from "@/components/admin/CategoriesManager";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const [categories, files, pending] = await Promise.all([
    prisma.category.findMany({
      orderBy: { position: "asc" },
      include: { _count: { select: { files: true } } },
    }),
    prisma.file.findMany({
      orderBy: { title: "asc" },
      select: { id: true, title: true, categoryId: true },
    }),
    prisma.comment.count({ where: { isApproved: null } }),
  ]);

  const cats = categories.map((c) => ({
    id: c.id,
    name: c.name,
    position: c.position,
    fileCount: c._count.files,
  }));

  return (
    <>
      <PageHeader
        title="Categories"
        subtitle="Organize the library. Reorder, rename, and move files."
        pendingCount={pending}
      />
      <div className="p-8">
        <CategoriesManager categories={cats} files={files} />
      </div>
    </>
  );
}
