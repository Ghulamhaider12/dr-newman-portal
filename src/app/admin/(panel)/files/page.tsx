import { prisma } from '@/lib/prisma';
import { PageHeader } from '@/components/admin/PageHeader';
import { FilesManager } from '@/components/admin/FilesManager';

export const dynamic = 'force-dynamic';

export default async function AdminFilesPage() {
  const [files, categories, pending] = await Promise.all([
    prisma.file.findMany({
      orderBy: { dateUploaded: 'desc' },
      include: {
        category: { select: { name: true } },
        helpingMaterials: { orderBy: { position: 'asc' } },
      },
    }),
    prisma.category.findMany({ orderBy: { position: 'asc' } }),
    prisma.comment.count({ where: { isApproved: null } }),
  ]);

  // Serialize dates for the client component.
  const rows = files.map((f) => ({
    ...f,
    dateUploaded: f.dateUploaded.toISOString(),
    createdAt: f.createdAt.toISOString(),
    helpingMaterials: f.helpingMaterials.map((m) => ({
      id: m.id,
      title: m.title,
      filename: m.filename,
      storageKey: m.storageKey,
      fileType: m.fileType,
      fileSize: m.fileSize,
    })),
  }));

  return (
    <>
      <PageHeader
        title="File Management"
        subtitle="Add, edit, and remove library files."
        pendingCount={pending}
      />
      <div className="p-8">
        <FilesManager files={rows} categories={categories} />
      </div>
    </>
  );
}
