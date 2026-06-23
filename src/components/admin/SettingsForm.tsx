"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImageUp } from "lucide-react";
import { Textarea, Label } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

type Settings = {
  welcome: string;
  copyright: string;
  commercial: string;
  privacy: string;
  background_photo: string;
};

const FIELDS: { key: keyof Settings; label: string; help: string }[] = [
  {
    key: "welcome",
    label: "Welcome message",
    help: "Shown under the homepage hero heading.",
  },
  {
    key: "copyright",
    label: "Footer copyright",
    help: "Shown in the site footer.",
  },
  {
    key: "commercial",
    label: "Copyright / commercial notice",
    help: "Shown on every file page below the download action.",
  },
  {
    key: "privacy",
    label: "Privacy note",
    help: "Shown beside the comment email field and in the footer.",
  },
];

export function SettingsForm({
  initial,
  backgroundUrl,
}: {
  initial: Settings;
  backgroundUrl: string;
}) {
  const router = useRouter();
  const [values, setValues] = useState<Settings>(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(backgroundUrl);

  function set(key: keyof Settings, value: string) {
    setValues((v) => ({ ...v, [key]: value }));
    setSaved(false);
  }

  async function uploadBackground(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const form = new FormData();
    form.append("file", file);
    form.append("kind", "background");
    const res = await fetch("/api/upload", { method: "POST", body: form });
    const json = await res.json();
    setUploading(false);
    if (res.ok) {
      set("background_photo", json.storageKey);
      setPreview(`/uploads/${json.storageKey.replace(/^uploads\//, "")}`);
    }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
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
            rows={f.key === "welcome" || f.key === "commercial" ? 3 : 2}
          />
          <p className="mt-1 text-xs text-ink-muted">{f.help}</p>
        </div>
      ))}

      <div>
        <Label>Homepage background photo</Label>
        <div className="rounded-card border border-border bg-white p-4">
          {preview ? (
            <div className="relative mb-3 h-40 w-full overflow-hidden rounded-control bg-surface">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="Background preview" className="h-full w-full object-cover" />
            </div>
          ) : (
            <p className="mb-3 text-sm text-ink-muted">
              No photo set — the hero shows a solid steel-blue panel.
            </p>
          )}
          <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-control border border-border-strong px-4 text-sm font-medium text-ink hover:bg-surface">
            <ImageUp size={16} />
            {uploading ? "Uploading…" : "Upload photo"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={uploadBackground}
            />
          </label>
        </div>
      </div>

      <div className="flex items-center gap-4 border-t border-border pt-5">
        <Button type="submit" variant="success" disabled={saving}>
          {saving ? "Saving…" : "Save settings"}
        </Button>
        {saved && <span className="text-sm text-success">Settings saved.</span>}
      </div>
    </form>
  );
}
