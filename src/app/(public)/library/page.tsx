import type { Prisma, FileType } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { LibraryFilters } from '@/components/public/LibraryFilters';
import { FileCard, type FileCardData } from '@/components/public/FileCard';

export const metadata = { alternates: { canonical: '/library' } };
export const dynamic = 'force-dynamic';

const VALID_TYPES = new Set(['PDF', 'MP3', 'MP4', 'JPG', 'PNG', 'PPT', 'XLS', 'DOC']);

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: { q?: string; category?: string; type?: string; sort?: string };
}) {
  const q = (searchParams.q ?? '').trim();
  const categoryId = Number(searchParams.category) || undefined;
  const type =
    searchParams.type && VALID_TYPES.has(searchParams.type)
      ? (searchParams.type as FileType)
      : undefined;

  const where: Prisma.FileWhereInput = {
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
          ],
        }
      : {}),
    ...(categoryId ? { categoryId } : {}),
    ...(type ? { fileType: type } : {}),
  };

  const [categories, files] = await Promise.all([
    prisma.category.findMany({ orderBy: { position: 'asc' } }),
    prisma.file.findMany({
      where,
      orderBy: { dateUploaded: 'desc' },
      include: { category: { select: { name: true } } },
    }),
  ]);

  return (
    <>
      <section className="bg-primary-light">
        <div className="container-page py-16">
          <h1 className="font-serif text-3xl font-semibold text-ink">Content Library</h1>
          <p className="mt-2 max-w-2xl text-ink-muted">
            Browse every paper, talk, recording, and image. Filter by category or file type, or
            search by title.
          </p>
        </div>
      </section>

      {/* Listing — the photo sits behind the file grid, softened by a light
          scrim so the cards and filters stay readable */}
      <section className="relative overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/morning-line.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="container-page relative py-12">
          <LibraryFilters categories={categories} />

          <p className="mt-8 text-sm font-medium text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.5)]">
            {files.length} {files.length === 1 ? 'item' : 'items'}
          </p>

          {files.length === 0 ? (
            <div className="mt-6 rounded-card border border-dashed border-border bg-surface p-16 text-center">
              <p className="font-serif text-xl text-ink">No items match these filters.</p>
              <p className="mt-2 text-sm text-ink-muted">
                Try clearing the search or choosing a different category.
              </p>
            </div>
          ) : (
            <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {files.map((f) => (
                <FileCard key={f.id} file={f as unknown as FileCardData} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
