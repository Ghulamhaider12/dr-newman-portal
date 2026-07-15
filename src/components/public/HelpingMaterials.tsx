'use client';

import { useState } from 'react';
import { ChevronDown, Download } from 'lucide-react';
import { FileTypeBadge } from '@/components/ui/Badge';
import { ButtonLink } from '@/components/ui/Button';
import { FilePreview } from '@/components/public/FilePreview';
import { cn, formatFileSize } from '@/lib/utils';
import type { FileType } from '@prisma/client';

type Material = {
  id: number;
  title: string;
  filename: string;
  fileType: FileType;
  fileSize: number;
  previewUrl: string;
};

/**
 * Collapsible list of supplementary files on the file detail page. Each item is
 * a compact row (badge · label · size · Download); clicking the row expands a
 * small inline preview. Client component because the page itself is a server
 * component and this needs open/close state.
 */
export function HelpingMaterials({ fileId, materials }: { fileId: number; materials: Material[] }) {
  const [open, setOpen] = useState<Set<number>>(new Set());

  function toggle(id: number) {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  if (materials.length === 0) return null;

  return (
    <div className="mt-8">
      <h2 className="font-serif text-xl font-semibold text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.5)]">
        Helping material{' '}
        <span className="font-sans text-base font-normal text-white/80">({materials.length})</span>
      </h2>

      <div className="mt-4 divide-y divide-border overflow-hidden rounded-card border border-white/20 bg-white/95 shadow-card">
        {materials.map((m) => {
          const isOpen = open.has(m.id);
          const label = m.title || m.filename;
          const panelId = `hm-panel-${m.id}`;
          return (
            <div key={m.id}>
              <div className="flex items-center gap-3 p-3 sm:p-4">
                <button
                  type="button"
                  onClick={() => toggle(m.id)}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  className="flex min-w-0 flex-1 items-center gap-3 rounded-control text-left transition-colors"
                >
                  <ChevronDown
                    size={18}
                    className={cn(
                      'shrink-0 text-ink-muted transition-transform duration-200',
                      isOpen && 'rotate-180'
                    )}
                  />
                  <FileTypeBadge type={m.fileType} />
                  <span className="truncate font-medium text-ink">{label}</span>
                  <span className="shrink-0 text-sm text-ink-muted">
                    {formatFileSize(m.fileSize)}
                  </span>
                </button>
                <ButtonLink
                  href={`/library/${fileId}/materials/${m.id}/download`}
                  variant="success"
                  size="sm"
                  className="shrink-0"
                >
                  <Download size={16} />
                  <span className="hidden sm:inline">Download</span>
                </ButtonLink>
              </div>

              {isOpen && (
                <div id={panelId} className="border-t border-border bg-surface p-3 sm:p-4">
                  <FilePreview compact fileType={m.fileType} url={m.previewUrl} title={label} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
