import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/apiAuth';

/** Admin: toggle a synced video's visibility on the public /videos listing. */
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const id = Number(params.id);
  const body = await req.json().catch(() => null);
  if (!id || !body || typeof body.isHidden !== 'boolean') {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const video = await prisma.video.update({
    where: { id },
    data: { isHidden: body.isHidden },
  });
  return NextResponse.json({ ok: true, video });
}
