import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/apiAuth";
import { detectFileType } from "@/lib/fileType";
import { parseYoutube } from "@/lib/utils";

/** Admin: update a file record. */
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const id = Number(params.id);
  if (!id) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const data: Record<string, unknown> = {};
  if (typeof body.title === "string") data.title = body.title.trim();
  if (typeof body.description === "string") data.description = body.description;
  if ("categoryId" in body)
    data.categoryId = body.categoryId ? Number(body.categoryId) : null;
  if (body.dateUploaded) data.dateUploaded = new Date(body.dateUploaded);

  // Optional new source (re-upload or switch to YouTube)
  if (body.isYoutube === true) {
    const watch = parseYoutube(body.url ?? "");
    if (!watch)
      return NextResponse.json({ error: "Invalid YouTube URL." }, { status: 400 });
    data.isYoutube = true;
    data.url = watch;
    data.fileType = "MP4";
    data.storageKey = "";
    data.fileSize = 0;
  } else if (body.storageKey) {
    const detected = detectFileType(body.filename ?? body.storageKey);
    if (detected) data.fileType = detected;
    data.isYoutube = false;
    data.url = "";
    data.storageKey = body.storageKey;
    data.fileSize = Number(body.fileSize) || 0;
  }

  const file = await prisma.file.update({ where: { id }, data });
  return NextResponse.json({ ok: true, file });
}

/** Admin: delete a file (and its comments via cascade). */
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const id = Number(params.id);
  if (!id) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.file.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
