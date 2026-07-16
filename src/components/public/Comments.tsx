'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input, Textarea, Label } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/utils';

export type PublicComment = {
  id: number;
  content: string;
  email: string | null;
  createdAt: string | Date;
};

function initialFromEmail(email: string | null) {
  return ((email ?? '').trim()[0] || '?').toUpperCase();
}

function CommentCard({ comment }: { comment: PublicComment }) {
  const name = comment.email ? comment.email.split('@')[0].replace(/[._]/g, ' ') : 'Anonymous';
  return (
    <div className="rounded-card border border-border bg-surface p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-light font-semibold text-primary">
          {initialFromEmail(comment.email)}
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-ink">{name}</span>
            <span className="text-xs text-ink-muted">{formatDate(comment.createdAt)}</span>
          </div>
          <p className="mt-1 text-base text-ink">{comment.content}</p>
        </div>
      </div>
    </div>
  );
}

export function Comments({
  fileId,
  comments,
  privacyNote,
}: {
  fileId: number;
  comments: PublicComment[];
  privacyNote: string;
}) {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [email, setEmail] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setStatus('sending');
    try {
      const res = await fetch(`/api/files/${fileId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, email, isPublic }),
      });
      if (!res.ok) throw new Error('failed');
      setStatus('done');
      setContent('');
      setEmail('');
      router.refresh();
    } catch {
      setStatus('error');
    }
  }

  return (
    <div className="rounded-card border border-border bg-white p-6 shadow-card">
      <h2 className="font-serif text-2xl font-semibold text-ink">Comments</h2>
      <p className="mt-1 text-sm text-ink-muted">
        {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
      </p>

      <div className="scroll-area mt-5 max-h-[420px] space-y-3 overflow-y-auto pr-1">
        {comments.length === 0 ? (
          <p className="rounded-card border border-dashed border-border bg-surface p-6 text-center text-sm text-ink-muted">
            No comments yet. Be the first to share your thoughts.
          </p>
        ) : (
          comments.map((c) => <CommentCard key={c.id} comment={c} />)
        )}
      </div>

      <form onSubmit={submit} className="mt-6 border-t border-border pt-6">
        <h3 className="font-serif text-lg font-semibold text-ink">Leave a comment</h3>
        {status === 'done' ? (
          <p className="mt-3 rounded-control bg-cat-art-bg p-3 text-sm text-success">
            Thank you. Your comment has been submitted and will appear once Dr. Newman has reviewed
            it.
          </p>
        ) : (
          <>
            <div className="mt-4">
              <Label htmlFor="c-content">Comment</Label>
              <Textarea
                id="c-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share your thoughts…"
                required
              />
            </div>
            <div className="mt-4">
              <Label htmlFor="c-email">Email (optional)</Label>
              <Input
                id="c-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
              <p className="mt-1.5 text-xs text-ink-muted">
                Only needed if you would like to receive a reply. {privacyNote}
              </p>
            </div>
            <label className="mt-4 flex items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                checked={!isPublic}
                onChange={(e) => setIsPublic(!e.target.checked)}
                className="h-4 w-4 accent-primary"
              />
              Keep this comment private (only Dr. Newman will see it)
            </label>
            {status === 'error' && (
              <p className="mt-3 text-sm text-[#B23B3B]">Something went wrong. Please try again.</p>
            )}
            <div className="mt-5">
              <Button type="submit" disabled={status === 'sending'}>
                {status === 'sending' ? 'Submitting…' : 'Submit comment'}
              </Button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}
