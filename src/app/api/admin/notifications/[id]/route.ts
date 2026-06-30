import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/apiAuth';

/** Admin: toggle read and/or favourite. Body: { isRead?: boolean, isFavourite?: boolean }. */
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const id = Number(params.id);
  const body = await req.json().catch(() => null);
  if (!id || !body) return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });

  const data: { isRead?: boolean; isFavourite?: boolean } = {};
  if (typeof body.isRead === 'boolean') data.isRead = body.isRead;
  if (typeof body.isFavourite === 'boolean') data.isFavourite = body.isFavourite;

  if (Object.keys(data).length === 0)
    return NextResponse.json({ error: 'Nothing to update.' }, { status: 400 });

  const notification = await prisma.notification.update({ where: { id }, data });
  return NextResponse.json({ ok: true, notification });
}
