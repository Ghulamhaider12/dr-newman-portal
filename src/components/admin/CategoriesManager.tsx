"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, ArrowUp, ArrowDown, FolderInput } from "lucide-react";
import { Input, Select, Label } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/admin/Modal";

type Category = { id: number; name: string; position: number; fileCount: number };
type FileLite = { id: number; title: string; categoryId: number | null };

export function CategoriesManager({
  categories,
  files,
}: {
  categories: Category[];
  files: FileLite[];
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  // move-file panel
  const [moveFileId, setMoveFileId] = useState("");
  const [moveCatId, setMoveCatId] = useState("");
  const [moveMsg, setMoveMsg] = useState("");

  async function addCategory(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error || "Could not add category.");
      return;
    }
    setName("");
    router.refresh();
  }

  async function reorder(id: number, direction: "up" | "down") {
    await fetch("/api/categories/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, direction }),
    });
    router.refresh();
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    const res = await fetch(`/api/categories/${deleteTarget.id}`, {
      method: "DELETE",
    });
    const json = await res.json().catch(() => ({}));
    setDeleteTarget(null);
    if (!res.ok) {
      setError(json.error || "Could not delete category.");
      return;
    }
    router.refresh();
  }

  async function moveFile(e: React.FormEvent) {
    e.preventDefault();
    setMoveMsg("");
    if (!moveFileId) return;
    const res = await fetch(`/api/files/${moveFileId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categoryId: moveCatId || null }),
    });
    if (res.ok) {
      setMoveMsg("File moved.");
      setMoveFileId("");
      setMoveCatId("");
      router.refresh();
    } else {
      setMoveMsg("Could not move the file.");
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
      <div>
        <form
          onSubmit={addCategory}
          className="flex items-end gap-3 rounded-card border border-border bg-white p-5 shadow-card"
        >
          <div className="flex-1">
            <Label htmlFor="cat-name">New category</Label>
            <Input
              id="cat-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Lectures"
              required
            />
          </div>
          <Button type="submit">
            <Plus size={18} /> Add
          </Button>
        </form>
        {error && <p className="mt-3 text-sm text-[#B23B3B]">{error}</p>}

        <div className="mt-6 overflow-hidden rounded-card border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface text-xs font-semibold uppercase tracking-[0.04em] text-ink-muted">
              <tr>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Files</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {categories.map((c, i) => (
                <tr key={c.id} className="bg-white">
                  <td className="px-4 py-3 font-medium text-ink">{c.name}</td>
                  <td className="px-4 py-3 text-ink-muted">{c.fileCount}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => reorder(c.id, "up")}
                        disabled={i === 0}
                        aria-label="Move up"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-control border border-border text-ink-muted hover:bg-surface disabled:opacity-40"
                      >
                        <ArrowUp size={16} />
                      </button>
                      <button
                        onClick={() => reorder(c.id, "down")}
                        disabled={i === categories.length - 1}
                        aria-label="Move down"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-control border border-border text-ink-muted hover:bg-surface disabled:opacity-40"
                      >
                        <ArrowDown size={16} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(c)}
                        disabled={c.fileCount > 0}
                        title={
                          c.fileCount > 0
                            ? "Move its files before deleting"
                            : "Delete category"
                        }
                        aria-label={`Delete ${c.name}`}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-control border border-[#E3C3C3] text-[#B23B3B] hover:bg-[#FBEDED] disabled:opacity-40"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Move a file to another category */}
      <form
        onSubmit={moveFile}
        className="h-fit rounded-card border border-border bg-white p-5 shadow-card"
      >
        <h2 className="flex items-center gap-2 font-serif text-lg font-semibold text-ink">
          <FolderInput size={18} className="text-accent" /> Move a file
        </h2>
        <p className="mt-1 text-sm text-ink-muted">
          Reassign any file to a different category.
        </p>
        <div className="mt-4">
          <Label htmlFor="move-file">File</Label>
          <Select
            id="move-file"
            value={moveFileId}
            onChange={(e) => setMoveFileId(e.target.value)}
          >
            <option value="">Select a file…</option>
            {files.map((f) => (
              <option key={f.id} value={f.id}>
                {f.title}
              </option>
            ))}
          </Select>
        </div>
        <div className="mt-4">
          <Label htmlFor="move-cat">Destination category</Label>
          <Select
            id="move-cat"
            value={moveCatId}
            onChange={(e) => setMoveCatId(e.target.value)}
          >
            <option value="">Uncategorized</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>
        <Button type="submit" className="mt-5 w-full" disabled={!moveFileId}>
          Move file
        </Button>
        {moveMsg && <p className="mt-3 text-sm text-success">{moveMsg}</p>}
      </form>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this category?"
        message={`"${deleteTarget?.name}" will be removed. This cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
