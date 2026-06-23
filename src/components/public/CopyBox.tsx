"use client";

import { useState } from "react";
import { Copy, Check, Youtube } from "lucide-react";

/** A copyable URL box for YouTube items — the URL is never embedded. */
export function CopyBox({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore — clipboard may be unavailable
    }
  }

  return (
    <div className="rounded-card border border-border bg-surface p-4">
      <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-ink">
        <Youtube size={18} className="text-[#B23B3B]" />
        Watch on YouTube
      </div>
      <div className="flex items-stretch gap-2">
        <input
          readOnly
          value={url}
          onFocus={(e) => e.currentTarget.select()}
          className="h-11 flex-1 rounded-control border border-border-strong bg-white px-3 text-sm text-ink"
          aria-label="YouTube URL"
        />
        <button
          onClick={copy}
          className="inline-flex h-11 items-center gap-2 rounded-control bg-primary px-4 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
          {copied ? "Copied" : "Copy URL"}
        </button>
      </div>
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="mt-3 inline-block text-sm text-accent hover:text-accent-hover hover:underline"
      >
        Open in a new tab →
      </a>
    </div>
  );
}
