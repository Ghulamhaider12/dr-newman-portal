import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/apiAuth";
import { createNotification } from "@/lib/notifications";

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

  // Fail-soft in-app notification — only for an actual approve/reject decision.
  if (isApproved === true || isApproved === false) {
    await createNotification({
      type: "MODERATION",
      title: isApproved ? "Comment approved" : "Comment rejected",
      body: isApproved
        ? "A comment was approved and is now public."
        : "A comment was rejected and will not appear publicly.",
      fileId: comment.fileId,
    });
  }

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
