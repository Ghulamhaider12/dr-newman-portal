import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/apiAuth";

/** Admin: approve / reject a comment. */
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const id = Number(params.id);
  const body = await req.json().catch(() => null);
  if (!id || !body)
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  // action: "approve" | "reject"
  const isApproved =
    body.action === "approve" ? true : body.action === "reject" ? false : null;

  const comment = await prisma.comment.update({
    where: { id },
    data: { isApproved },
  });
  return NextResponse.json({ ok: true, comment });
}

/** Admin: delete a comment. */
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const id = Number(params.id);
  if (!id) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.comment.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
