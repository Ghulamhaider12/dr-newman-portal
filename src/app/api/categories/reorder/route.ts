import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/apiAuth";

/** Admin: move a category up/down by swapping positions with its neighbour. */
export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = await req.json().catch(() => null);
  const id = Number(body?.id);
  const direction = body?.direction as "up" | "down";
  if (!id || (direction !== "up" && direction !== "down")) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const current = await prisma.category.findUnique({ where: { id } });
  if (!current)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const neighbour = await prisma.category.findFirst({
    where:
      direction === "up"
        ? { position: { lt: current.position } }
        : { position: { gt: current.position } },
    orderBy: { position: direction === "up" ? "desc" : "asc" },
  });
  if (!neighbour) return NextResponse.json({ ok: true }); // already at edge

  await prisma.$transaction([
    prisma.category.update({
      where: { id: current.id },
      data: { position: neighbour.position },
    }),
    prisma.category.update({
      where: { id: neighbour.id },
      data: { position: current.position },
    }),
  ]);
  return NextResponse.json({ ok: true });
}
