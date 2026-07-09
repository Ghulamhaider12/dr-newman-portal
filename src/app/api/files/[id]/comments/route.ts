import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { notifyNewComment } from '@/lib/email';
import { createNotification } from '@/lib/notifications';

/** Public: submit a comment. Starts pending (is_approved = null). */
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const fileId = Number(params.id);
  if (!fileId) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  let body: { content?: string; email?: string; isPublic?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  const content = (body.content ?? '').trim();
  const email = (body.email ?? '').trim();
  const isPublic = body.isPublic !== false;

  if (!content) {
    return NextResponse.json({ error: 'A comment is required.' }, { status: 400 });
  }

  // Email is optional — visitors only leave it if they want a reply — but if
  // one is given it must be well-formed.
  if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json(
      { error: 'Please enter a valid email address, or leave it blank.' },
      { status: 400 }
    );
  }

  const file = await prisma.file.findUnique({ where: { id: fileId } });
  if (!file) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const comment = await prisma.comment.create({
    data: {
      fileId,
      content,
      email: email || null,
      isPublic,
      isApproved: null, // pending until an admin approves
    },
  });

  // Fail-soft email notification — never blocks the visitor.
  await notifyNewComment({
    fileTitle: file.title,
    fileId,
    email: email || null,
    content,
    isPublic,
  });

  // Fail-soft in-app notification for the admin panel.
  await createNotification({
    type: 'COMMENT',
    title: 'New comment awaiting review',
    body: `A ${isPublic ? 'public' : 'private'} comment was submitted by ${
      email || 'an anonymous visitor'
    }.`,
    fileId,
  });

  return NextResponse.json({ ok: true, id: comment.id }, { status: 201 });
}
