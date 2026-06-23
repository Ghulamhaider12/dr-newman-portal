"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Search } from "lucide-react";
import { Input, Select, Label } from "@/components/ui/Field";
import { fileTypeLabel } from "@/lib/fileType";
import type { FileType } from "@prisma/client";

const FILE_TYPES: FileType[] = [
  "PDF",
  "MP3",
  "MP4",
  "JPG",
  "PNG",
  "PPT",
  "XLS",
  "DOC",
];

export function LibraryFilters({
  categories,
}: {
  categories: { id: number; name: string }[];
}) {
  const router = useRouter();
  const params = useSearchParams();

  const update = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(params.toString());
      if (value) next.set(key, value);
      else next.delete(key);
      router.replace(`/library?${next.toString()}`, { scroll: false });
    },
    [params, router]
  );

  return (
    <div className="grid gap-4 md:grid-cols-[2fr_1fr_1fr]">
      <div>
        <Label htmlFor="q">Search</Label>
        <div className="relative">
          <Search
            size={18}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted"
          />
          <Input
            id="q"
            defaultValue={params.get("q") ?? ""}
            onChange={(e) => update("q", e.target.value)}
            placeholder="Search titles and topics…"
            className="pl-10"
          />
        </div>
      </div>
      <div>
        <Label htmlFor="category">Category</Label>
        <Select
          id="category"
          defaultValue={params.get("category") ?? ""}
          onChange={(e) => update("category", e.target.value)}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor="type">File type</Label>
        <Select
          id="type"
          defaultValue={params.get("type") ?? ""}
          onChange={(e) => update("type", e.target.value)}
        >
          <option value="">All types</option>
          {FILE_TYPES.map((t) => (
            <option key={t} value={t}>
              {fileTypeLabel(t)}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
}
