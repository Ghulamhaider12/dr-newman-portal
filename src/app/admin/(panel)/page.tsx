import Link from "next/link";
import {
  FolderOpen,
  MessageSquare,
  CheckCircle2,
  Tags,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/PageHeader";
import { FileTypeBadge, CategoryBadge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [totalFiles, pending, approved, categories, recent] = await Promise.all([
    prisma.file.count(),
    prisma.comment.count({ where: { isApproved: null } }),
    prisma.comment.count({ where: { isApproved: true } }),
    prisma.category.count(),
    prisma.file.findMany({
      orderBy: { dateUploaded: "desc" },
      take: 5,
      include: { category: { select: { name: true } } },
    }),
  ]);

  const stats = [
    { label: "Total files", value: totalFiles, icon: FolderOpen, tint: "#EBF3FA", color: "#2C5F8A" },
    { label: "Pending comments", value: pending, icon: MessageSquare, tint: "#FBF3EA", color: "#B87333" },
    { label: "Approved comments", value: approved, icon: CheckCircle2, tint: "#E5F0EA", color: "#3A7D44" },
    { label: "Categories", value: categories, icon: Tags, tint: "#E5F0F2", color: "#4A90A4" },
  ];

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="An overview of your library and activity."
        pendingCount={pending}
      />
      <div className="p-8">
        <div className="grid gap-6 sm:grid-cols-2">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className="rounded-card border border-border bg-white p-6 shadow-card"
              >
                <span
                  className="flex h-11 w-11 items-center justify-center rounded-card"
                  style={{ backgroundColor: s.tint, color: s.color }}
                >
                  <Icon size={20} />
                </span>
                <p className="mt-5 font-serif text-4xl font-semibold text-ink">
                  {s.value}
                </p>
                <p className="mt-1 text-sm text-ink-muted">{s.label}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-10">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl font-semibold text-ink">
              Recent uploads
            </h2>
            <Link
              href="/admin/files"
              className="text-sm font-medium text-accent hover:text-accent-hover hover:underline"
            >
              Manage files →
            </Link>
          </div>
          <div className="mt-4 overflow-hidden rounded-card border border-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface text-xs font-semibold uppercase tracking-[0.04em] text-ink-muted">
                <tr>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Uploaded</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recent.map((f) => (
                  <tr key={f.id} className="bg-white">
                    <td className="px-4 py-3 font-medium text-ink">{f.title}</td>
                    <td className="px-4 py-3">
                      <CategoryBadge name={f.category?.name} />
                    </td>
                    <td className="px-4 py-3">
                      <FileTypeBadge type={f.fileType} />
                    </td>
                    <td className="px-4 py-3 text-ink-muted">
                      {formatDate(f.dateUploaded)}
                    </td>
                  </tr>
                ))}
                {recent.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-ink-muted">
                      No files yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
