import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/apiAuth";
import { detectFileType } from "@/lib/fileType";
import { parseYoutube } from "@/lib/utils";

/** Admin: create a file record (after upload or with a YouTube URL). */
export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const title = (body.title ?? "").trim();
  if (!title) {
    return NextResponse.json({ error: "Title is required." }, { status: 400 });
  }

  const isYoutube = Boolean(body.isYoutube);
  let fileType = body.fileType;
  let url = (body.url ?? "").trim();
  let storageKey = (body.storageKey ?? "").trim();
  let fileSize = Number(body.fileSize) || 0;

  if (isYoutube) {
    const watch = parseYoutube(url);
    if (!watch) {
      return NextResponse.json(
        { error: "Enter a valid YouTube URL." },
        { status: 400 }
      );
    }
    url = watch;
    fileType = "MP4";
    storageKey = "";
    fileSize = 0;
  } else {
    // Auto-detect from the original filename (no manual dropdown).
    const detected = detectFileType(body.filename ?? storageKey ?? "");
    fileType = fileType ?? detected;
    if (!fileType) {
      return NextResponse.json(
        { error: "Could not determine the file type from the upload." },
        { status: 400 }
      );
    }
    if (!storageKey) {
      return NextResponse.json(
        { error: "An uploaded file is required." },
        { status: 400 }
      );
    }
  }

  const file = await prisma.file.create({
    data: {
      title,
      description: body.description ?? "",
      categoryId: body.categoryId ? Number(body.categoryId) : null,
      fileType,
      url,
      storageKey,
      fileSize,
      isYoutube,
      dateUploaded: body.dateUploaded ? new Date(body.dateUploaded) : new Date(),
    },
  });

  return NextResponse.json({ ok: true, file }, { status: 201 });
}
