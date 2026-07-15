import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSignedDownloadUrl } from '@/lib/spaces';

/**
 * Redirects to a short-lived signed Spaces URL for a helping-material file.
 * Mirrors the main file download route; helping materials have no download
 * counter, so this just verifies ownership and hands back a signed URL.
 */
export async function GET(_req: Request, { params }: { params: { id: string; mid: string } }) {
  const id = Number(params.id);
  const mid = Number(params.mid);
  if (!id || !mid) return new NextResponse('Not found', { status: 404 });

  const material = await prisma.helpingMaterial.findUnique({
    where: { id: mid },
  });
  // Verify the material belongs to the file in the URL before serving it.
  if (!material || material.fileId !== id) {
    return new NextResponse('Not found', { status: 404 });
  }

  if (!material.storageKey) {
    return new NextResponse('This file is not available for download.', {
      status: 404,
    });
  }

  const url = await getSignedDownloadUrl(material.storageKey);
  // Keep the Location relative for local-fallback URLs (see the main download
  // route) so a proxy's internal host is never leaked to the browser.
  return new NextResponse(null, { status: 307, headers: { Location: url } });
}
