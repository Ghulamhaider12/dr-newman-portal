'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Pencil, Trash2, Upload, Youtube, FileCheck2 } from 'lucide-react';
import { Modal, ConfirmDialog } from '@/components/admin/Modal';
import { Wysiwyg } from '@/components/admin/Wysiwyg';
import { Input, Select, Label } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { FileTypeBadge, CategoryBadge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import type { FileType } from '@prisma/client';

type Material = {
  title: string;
  filename: string;
  storageKey: string;
  fileType: FileType;
  fileSize: number;
};

type FileRow = {
  id: number;
  title: string;
  description: string;
  categoryId: number | null;
  fileType: FileType;
  isYoutube: boolean;
  url: string;
  storageKey: string;
  fileSize: number;
  dateUploaded: string;
  category: { name: string } | null;
  helpingMaterials: Array<Material & { id: number }>;
};

type Category = { id: number; name: string };

const todayISO = (d?: string) => (d ? new Date(d) : new Date()).toISOString().slice(0, 10);

export function FilesManager({ files, categories }: { files: FileRow[]; categories: Category[] }) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<FileRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FileRow | null>(null);

  // form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [date, setDate] = useState(todayISO());
  const [source, setSource] = useState<'upload' | 'youtube'>('upload');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [upload, setUpload] = useState<{
    storageKey: string;
    filename: string;
    fileType: FileType;
    fileSize: number;
  } | null>(null);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function openAdd() {
    setEditing(null);
    setTitle('');
    setDescription('');
    setCategoryId('');
    setDate(todayISO());
    setSource('upload');
    setYoutubeUrl('');
    setUpload(null);
    setMaterials([]);
    setError('');
    setModalOpen(true);
  }

  function openEdit(f: FileRow) {
    setEditing(f);
    setTitle(f.title);
    setDescription(f.description);
    setCategoryId(f.categoryId ? String(f.categoryId) : '');
    setDate(todayISO(f.dateUploaded));
    setSource(f.isYoutube ? 'youtube' : 'upload');
    setYoutubeUrl(f.isYoutube ? f.url : '');
    setUpload(null);
    setMaterials(
      f.helpingMaterials.map((m) => ({
        title: m.title,
        filename: m.filename,
        storageKey: m.storageKey,
        fileType: m.fileType,
        fileSize: m.fileSize,
      }))
    );
    setError('');
    setModalOpen(true);
  }

  /** Upload a single file to storage and return its stored descriptor. */
  async function uploadFile(file: File) {
    const form = new FormData();
    form.append('file', file);
    form.append('kind', 'file');
    const res = await fetch('/api/upload', { method: 'POST', body: form });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Upload failed.');
    return json as {
      storageKey: string;
      filename: string;
      fileType: FileType;
      fileSize: number;
    };
  }

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      setUpload(await uploadFile(file));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setUploading(false);
    }
  }

  function addMaterialRow() {
    setMaterials((prev) => [
      ...prev,
      { title: '', filename: '', storageKey: '', fileType: 'PDF', fileSize: 0 },
    ]);
  }

  function removeMaterialRow(index: number) {
    setMaterials((prev) => prev.filter((_, i) => i !== index));
  }

  function updateMaterialTitle(index: number, title: string) {
    setMaterials((prev) => prev.map((m, i) => (i === index ? { ...m, title } : m)));
  }

  async function onMaterialFileChange(index: number, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const up = await uploadFile(file);
      setMaterials((prev) =>
        prev.map((m, i) =>
          i === index
            ? {
                ...m,
                filename: up.filename,
                storageKey: up.storageKey,
                fileType: up.fileType,
                fileSize: up.fileSize,
              }
            : m
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setUploading(false);
    }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }

    const payload: Record<string, unknown> = {
      title,
      description,
      categoryId: categoryId || null,
      dateUploaded: date,
    };

    if (source === 'youtube') {
      payload.isYoutube = true;
      payload.url = youtubeUrl;
    } else if (upload) {
      payload.isYoutube = false;
      payload.storageKey = upload.storageKey;
      payload.filename = upload.filename;
      payload.fileSize = upload.fileSize;
    } else if (!editing) {
      setError('Upload a file or provide a YouTube URL.');
      return;
    }

    // Only send materials with an uploaded object; the API validates + orders them.
    payload.helpingMaterials = materials.filter((m) => m.storageKey);

    setSaving(true);
    const res = await fetch(editing ? `/api/files/${editing.id}` : '/api/files', {
      method: editing ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    const json = await res.json();
    if (!res.ok) {
      setError(json.error || 'Could not save.');
      return;
    }
    setModalOpen(false);
    router.refresh();
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    await fetch(`/api/files/${deleteTarget.id}`, { method: 'DELETE' });
    setDeleteTarget(null);
    router.refresh();
  }

  return (
    <>
      <div className="mb-6 flex justify-end">
        <Button onClick={openAdd}>
          <Plus size={18} /> Add file
        </Button>
      </div>

      <div className="overflow-hidden rounded-card border border-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface text-xs font-semibold uppercase tracking-[0.04em] text-ink-muted">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {files.map((f) => (
              <tr key={f.id} className="bg-white">
                <td className="px-4 py-3 font-medium text-ink">{f.title}</td>
                <td className="px-4 py-3">
                  <CategoryBadge name={f.category?.name} />
                </td>
                <td className="px-4 py-3">
                  <FileTypeBadge type={f.fileType} />
                </td>
                <td className="px-4 py-3 text-ink-muted">{formatDate(f.dateUploaded)}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => openEdit(f)}
                      aria-label={`Edit ${f.title}`}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-control border border-border text-primary hover:bg-primary-light"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(f)}
                      aria-label={`Delete ${f.title}`}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-control border border-[#E3C3C3] text-[#B23B3B] hover:bg-[#FBEDED]"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {files.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-ink-muted">
                  No files yet. Add your first file to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit file' : 'Add file'}
      >
        <form onSubmit={save} className="space-y-5">
          <div>
            <Label htmlFor="f-title">Title</Label>
            <Input
              id="f-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Cardiac Imaging in Primary Care"
              required
            />
          </div>

          <div>
            <Label>Description</Label>
            <Wysiwyg
              value={description}
              onChange={setDescription}
              placeholder="A short summary shown on the file page…"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="f-category">Category</Label>
              <Select
                id="f-category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                <option value="">Select…</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="f-date">Date</Label>
              <Input
                id="f-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          {/* Source toggle */}
          <div>
            <Label>Source</Label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSource('upload')}
                className={`inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-control border text-sm font-medium ${
                  source === 'upload'
                    ? 'border-primary bg-primary-light text-primary'
                    : 'border-border-strong text-ink'
                }`}
              >
                <Upload size={16} /> Upload a file
              </button>
              <button
                type="button"
                onClick={() => setSource('youtube')}
                className={`inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-control border text-sm font-medium ${
                  source === 'youtube'
                    ? 'border-primary bg-primary-light text-primary'
                    : 'border-border-strong text-ink'
                }`}
              >
                <Youtube size={16} /> YouTube URL
              </button>
            </div>

            {source === 'upload' ? (
              <div className="mt-3">
                <input
                  id="f-file"
                  type="file"
                  onChange={onFileChange}
                  className="block w-full text-sm text-ink-muted file:mr-3 file:h-10 file:rounded-control file:border file:border-border-strong file:bg-white file:px-4 file:text-sm file:font-medium file:text-ink hover:file:bg-surface"
                />
                {uploading && <p className="mt-2 text-sm text-ink-muted">Uploading…</p>}
                {upload && (
                  <p className="mt-2 inline-flex items-center gap-2 text-sm text-success">
                    <FileCheck2 size={16} /> {upload.filename}
                    <FileTypeBadge type={upload.fileType} />
                    <span className="text-ink-muted">(type auto-detected)</span>
                  </p>
                )}
                {editing && !upload && !editing.isYoutube && (
                  <p className="mt-2 text-sm text-ink-muted">
                    Current file kept. Choose a new file to replace it.
                  </p>
                )}
              </div>
            ) : (
              <div className="mt-3">
                <Input
                  type="url"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=…"
                />
                <p className="mt-1.5 text-xs text-ink-muted">
                  Type is set to MP4. The video is never embedded — visitors get a copyable link.
                </p>
              </div>
            )}
          </div>

          {/* Helping material — supplementary files shown alongside this file */}
          <div className="border-t border-border pt-5">
            <div className="flex items-center justify-between">
              <Label>Helping material</Label>
              <button
                type="button"
                onClick={addMaterialRow}
                className="inline-flex items-center gap-1.5 rounded-control border border-border-strong px-3 py-1.5 text-sm font-medium text-ink hover:bg-surface"
              >
                <Plus size={15} /> Add material
              </button>
            </div>
            <p className="mt-1 text-xs text-ink-muted">
              Optional supporting files (handouts, references…) shown on the file page for visitors
              to preview and download.
            </p>

            {materials.length > 0 && (
              <ul className="mt-3 space-y-3">
                {materials.map((m, i) => (
                  <li key={i} className="rounded-control border border-border p-3">
                    <div className="flex items-start gap-2">
                      <div className="flex-1 space-y-2">
                        <Input
                          value={m.title}
                          onChange={(e) => updateMaterialTitle(i, e.target.value)}
                          placeholder="Optional label (defaults to the filename)"
                        />
                        <input
                          type="file"
                          onChange={(e) => onMaterialFileChange(i, e)}
                          className="block w-full text-sm text-ink-muted file:mr-3 file:h-9 file:rounded-control file:border file:border-border-strong file:bg-white file:px-3 file:text-sm file:font-medium file:text-ink hover:file:bg-surface"
                        />
                        {m.storageKey && (
                          <p className="inline-flex items-center gap-2 text-sm text-success">
                            <FileCheck2 size={16} /> {m.filename}
                            <FileTypeBadge type={m.fileType} />
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeMaterialRow(i)}
                        aria-label="Remove material"
                        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-control border border-[#E3C3C3] text-[#B23B3B] hover:bg-[#FBEDED]"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {error && <p className="text-sm text-[#B23B3B]">{error}</p>}

          <div className="flex justify-end gap-3 border-t border-border pt-5">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="inline-flex h-11 items-center rounded-control border border-border-strong px-5 text-base font-medium text-ink hover:bg-surface"
            >
              Cancel
            </button>
            <Button type="submit" variant="success" disabled={saving || uploading}>
              {saving ? 'Saving…' : editing ? 'Save changes' : 'Add file'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this file?"
        message={`"${deleteTarget?.title}" and its comments will be permanently removed. This cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
