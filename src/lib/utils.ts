import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/** "Mar 12, 2025" — quiet, factual metadata formatting. */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** "2.4 MB" — human file sizes. */
export function formatFileSize(bytes: number): string {
  if (!bytes || bytes <= 0) return "—";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit++;
  }
  return `${value.toFixed(value < 10 && unit > 0 ? 1 : 0)} ${units[unit]}`;
}

/** "1,204 downloads" */
export function formatCount(n: number): string {
  return n.toLocaleString("en-US");
}

/** Category colour key — Medical = blue, Art & Literature = teal, Other = grey. */
export function categoryColor(name?: string | null): "medical" | "art" | "other" {
  const n = (name ?? "").toLowerCase();
  if (n.includes("medical") || n.includes("medicine")) return "medical";
  if (n.includes("art") || n.includes("literature")) return "art";
  return "other";
}

/** Normalise a YouTube URL to its canonical watch URL. Returns null if not YouTube. */
export function parseYoutube(url: string): string | null {
  try {
    const u = new URL(url.trim());
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtu.be") {
      const id = u.pathname.slice(1);
      return id ? `https://www.youtube.com/watch?v=${id}` : null;
    }
    if (host === "youtube.com" || host === "m.youtube.com") {
      const id = u.searchParams.get("v");
      if (id) return `https://www.youtube.com/watch?v=${id}`;
      if (u.pathname.startsWith("/embed/")) {
        return `https://www.youtube.com/watch?v=${u.pathname.split("/")[2]}`;
      }
    }
    return null;
  } catch {
    return null;
  }
}

/** Strip HTML tags to a plain-text excerpt (for card previews). */
export function htmlToText(html: string, max = 160): string {
  const text = html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > max ? text.slice(0, max).trimEnd() + "…" : text;
}
