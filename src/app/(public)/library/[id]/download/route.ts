import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSignedDownloadUrl } from "@/lib/spaces";
import { parseYoutube } from "@/lib/utils";
import { notifyDownloadMilestone } from "@/lib/notifications";

/**
 * Increments the download counter, then redirects to a short-lived signed
 * Spaces URL (or the YouTube watch URL for video items).
 */
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  if (!id) return new NextResponse("Not found", { status: 404 });

  const file = await prisma.file.findUnique({ where: { id } });
  if (!file) return new NextResponse("Not found", { status: 404 });

  const updated = await prisma.file.update({
    where: { id },
    data: { downloads: { increment: 1 } },
  });

  // Fail-soft milestone notification (only when crossing 100/500/1,000…).
  await notifyDownloadMilestone({ id: file.id, title: file.title }, updated.downloads);

  if (file.isYoutube) {
    const watch = parseYoutube(file.url) ?? file.url;
    return NextResponse.redirect(watch);
  }

  if (!file.storageKey) {
    return new NextResponse("This file is not available for download.", {
      status: 404,
    });
  }

  const url = await getSignedDownloadUrl(file.storageKey);
  // Local-fallback URLs are relative; make them absolute against the request.
  const absolute = url.startsWith("http")
    ? url
    : new URL(url, _req.url).toString();
  return NextResponse.redirect(absolute);
}
