import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/admin/Sidebar";

export const dynamic = "force-dynamic";

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/admin/login");

  const pendingCount = await prisma.comment.count({
    where: { isApproved: null },
  });

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar pendingCount={pendingCount} />
      <div className="flex-1 overflow-x-hidden">{children}</div>
    </div>
  );
}
