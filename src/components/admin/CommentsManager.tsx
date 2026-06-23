"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Trash2, Lock } from "lucide-react";
import { ConfirmDialog } from "@/components/admin/Modal";
import { formatDate } from "@/lib/utils";

type CommentRow = {
  id: number;
  content: string;
  email: string;
  isPublic: boolean;
  isApproved: boolean | null;
  createdAt: string;
  file: { id: number; title: string };
};

type Tab = "pending" | "approved" | "private";

export function CommentsManager({ comments }: { comments: CommentRow[] }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("pending");
  const [deleteTarget, setDeleteTarget] = useState<CommentRow | null>(null);

  const pending = comments.filter((c) => c.isApproved === null);
  const approved = comments.filter((c) => c.isApproved === true && c.isPublic);
  const privateOnes = comments.filter((c) => !c.isPublic);

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "pending", label: "Pending", count: pending.length },
    { key: "approved", label: "Approved public", count: approved.length },
    { key: "private", label: "Private", count: privateOnes.length },
  ];

  const visible =
    tab === "pending" ? pending : tab === "approved" ? approved : privateOnes;

  async function moderate(id: number, action: "approve" | "reject") {
    await fetch(`/api/comments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    router.refresh();
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    await fetch(`/api/comments/${deleteTarget.id}`, { method: "DELETE" });
    setDeleteTarget(null);
    router.refresh();
  }

  return (
    <div>
      <div className="flex gap-1 border-b border-border">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`relative -mb-px flex items-center gap-2 px-4 py-3 text-sm font-medium ${
              tab === t.key
                ? "border-b-2 border-primary text-primary"
                : "text-ink-muted hover:text-ink"
            }`}
          >
            {t.label}
            <span
              className={`inline-flex h-5 min-w-5 items-center justify-center rounded-pill px-1.5 text-xs font-semibold ${
                t.key === "pending" && t.count > 0
                  ? "bg-warning text-white"
                  : "bg-surface text-ink-muted"
              }`}
            >
              {t.count}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-3">
        {visible.length === 0 ? (
          <p className="rounded-card border border-dashed border-border p-12 text-center text-ink-muted">
            Nothing here.
          </p>
        ) : (
          visible.map((c) => {
            const name = c.email.split("@")[0].replace(/[._]/g, " ");
            return (
              <div
                key={c.id}
                className="rounded-card border border-border bg-white p-5 shadow-card"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-ink">{name}</span>
                      <span className="text-xs text-ink-muted">{c.email}</span>
                      <span className="text-xs text-ink-muted">
                        · {formatDate(c.createdAt)}
                      </span>
                      {!c.isPublic && (
                        <span className="inline-flex items-center gap-1 rounded-badge bg-surface px-2 py-0.5 text-xs font-semibold text-ink-muted">
                          <Lock size={11} /> Private
                        </span>
                      )}
                    </div>
                    <p className="mt-1.5 text-base text-ink">{c.content}</p>
                    <p className="mt-2 text-xs text-ink-muted">
                      on{" "}
                      <a
                        href={`/library/${c.file.id}`}
                        className="text-accent hover:underline"
                      >
                        {c.file.title}
                      </a>
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    {tab === "pending" && c.isPublic && (
                      <button
                        onClick={() => moderate(c.id, "approve")}
                        className="inline-flex h-9 items-center gap-1.5 rounded-control bg-success px-3 text-sm font-medium text-white hover:bg-success-hover"
                      >
                        <Check size={15} /> Approve
                      </button>
                    )}
                    {tab === "pending" && c.isPublic && (
                      <button
                        onClick={() => moderate(c.id, "reject")}
                        className="inline-flex h-9 items-center gap-1.5 rounded-control border border-border-strong px-3 text-sm font-medium text-ink hover:bg-surface"
                      >
                        <X size={15} /> Reject
                      </button>
                    )}
                    <button
                      onClick={() => setDeleteTarget(c)}
                      aria-label="Delete comment"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-control border border-[#E3C3C3] text-[#B23B3B] hover:bg-[#FBEDED]"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this comment?"
        message="This comment will be permanently removed."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
