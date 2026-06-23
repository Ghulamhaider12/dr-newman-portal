import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/apiAuth";

/** Admin: create a category (placed at the end). */
export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = await req.json().catch(() => null);
  const name = (body?.name ?? "").trim();
  if (!name)
    return NextResponse.json({ error: "Name is required." }, { status: 400 });

  const existing = await prisma.category.findUnique({ where: { name } });
  if (existing)
    return NextResponse.json(
      { error: "A category with that name already exists." },
      { status: 409 }
    );

  const last = await prisma.category.findFirst({
    orderBy: { position: "desc" },
  });
  const category = await prisma.category.create({
    data: { name, position: (last?.position ?? -1) + 1 },
  });
  return NextResponse.json({ ok: true, category }, { status: 201 });
}
