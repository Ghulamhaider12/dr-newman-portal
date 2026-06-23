import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/apiAuth";

/** Admin: rename a category. */
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const id = Number(params.id);
  const body = await req.json().catch(() => null);
  const name = (body?.name ?? "").trim();
  if (!id || !name)
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  const category = await prisma.category.update({
    where: { id },
    data: { name },
  });
  return NextResponse.json({ ok: true, category });
}

/** Admin: delete a category — only when it holds no files. */
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const id = Number(params.id);
  if (!id) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const count = await prisma.file.count({ where: { categoryId: id } });
  if (count > 0) {
    return NextResponse.json(
      { error: "Move or remove its files before deleting this category." },
      { status: 409 }
    );
  }

  await prisma.category.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
