'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ImageUp } from 'lucide-react';
import { Textarea, Label } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';

type Settings = {
  hero_title: string;
  welcome: string;
  about: string;
  copyright: string;
  commercial: string;
  privacy: string;
  background_photo: string;
  recent_background_photo: string;
};

const FIELDS: { key: keyof Settings; label: string; help: string }[] = [
  {
    key: 'hero_title',
    label: 'Homepage title',
    help: 'The large heading at the top of the homepage.',
  },
  {
    key: 'welcome',
    label: 'Welcome message',
    help: 'Shown under the homepage hero heading.',
  },
  {
    key: 'about',
    label: 'About page content',
    help: 'The body text on the About page. Leave a blank line between paragraphs.',
  },
  {
    key: 'copyright',
    label: 'Footer copyright',
    help: 'Shown in the site footer.',
  },
  {
    key: 'commercial',
    label: 'Copyright / commercial notice',
    help: 'Shown on every file page below the download action.',
  },
  {
    key: 'privacy',
    label: 'Privacy note',
    help: 'Shown beside the comment email field and in the footer.',
  },
];

export function SettingsForm({
  initial,
  backgroundUrl,
  recentBackgroundUrl,
}: {
  initial: Settings;
  backgroundUrl: string;
  recentBackgroundUrl: string;
}) {
  const router = useRouter();
  const [values, setValues] = useState<Settings>(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function set(key: keyof Settings, value: string) {
    setValues((v) => ({ ...v, [key]: value }));
    setSaved(false);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      router.refresh();
    }
  }

  return (
    <form onSubmit={save} className="max-w-2xl space-y-6">
      {FIELDS.map((f) => (
        <div key={f.key}>
          <Label htmlFor={f.key}>{f.label}</Label>
          <Textarea
            id={f.key}
            value={values[f.key]}
            onChange={(e) => set(f.key, e.target.value)}
            rows={f.key === 'about' ? 8 : f.key === 'welcome' || f.key === 'commercial' ? 3 : 2}
          />
          <p className="mt-1 text-xs text-ink-muted">{f.help}</p>
        </div>
      ))}

      <BackgroundField
        label="Homepage hero background photo"
        help="Shown behind the welcome hero at the top of the homepage. Leave empty for a solid steel-blue panel."
        emptyText="No photo set — the hero shows a solid steel-blue panel."
        initialUrl={backgroundUrl}
        onUploaded={(key) => set('background_photo', key)}
      />

      <BackgroundField
        label="Recent additions background photo"
        help="Shown behind the “Recent additions” section lower on the homepage. Leave empty for the default light panel."
        emptyText="No photo set — the section shows the default light panel."
        initialUrl={recentBackgroundUrl}
        onUploaded={(key) => set('recent_background_photo', key)}
      />

      <div className="flex items-center gap-4 border-t border-border pt-5">
        <Button type="submit" variant="success" disabled={saving}>
          {saving ? 'Saving…' : 'Save settings'}
        </Button>
        {saved && <span className="text-sm text-success">Settings saved.</span>}
      </div>
    </form>
  );
}

/**
 * Reusable homepage-background uploader. Posts to /api/upload with kind=background
 * (public-read), then reports the returned storageKey up to the parent form via
 * onUploaded so it's saved when the form is submitted. The preview uses the local
 * /uploads path, which is correct in local-disk mode; after Save + refresh the
 * server re-renders the preview through the Spaces CDN URL.
 */
function BackgroundField({
  label,
  help,
  emptyText,
  initialUrl,
  onUploaded,
}: {
  label: string;
  help: string;
  emptyText: string;
  initialUrl: string;
  onUploaded: (storageKey: string) => void;
}) {
  const [preview, setPreview] = useState(initialUrl);
  const [uploading, setUploading] = useState(false);

  async function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const form = new FormData();
    form.append('file', file);
    form.append('kind', 'background');
    const res = await fetch('/api/upload', { method: 'POST', body: form });
    const json = await res.json();
    setUploading(false);
    if (res.ok) {
      onUploaded(json.storageKey);
      setPreview(`/uploads/${json.storageKey.replace(/^uploads\//, '')}`);
    }
  }

  return (
    <div>
      <Label>{label}</Label>
      <div className="rounded-card border border-border bg-white p-4">
        {preview ? (
          <div className="relative mb-3 h-40 w-full overflow-hidden rounded-control bg-surface">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Background preview" className="h-full w-full object-cover" />
          </div>
        ) : (
          <p className="mb-3 text-sm text-ink-muted">{emptyText}</p>
        )}
        <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-control border border-border-strong px-4 text-sm font-medium text-ink hover:bg-surface">
          <ImageUp size={16} />
          {uploading ? 'Uploading…' : 'Upload photo'}
          <input type="file" accept="image/*" className="hidden" onChange={upload} />
        </label>
      </div>
      <p className="mt-1 text-xs text-ink-muted">{help}</p>
    </div>
  );
}
