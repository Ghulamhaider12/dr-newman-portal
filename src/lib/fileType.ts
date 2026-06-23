import type { FileType } from "@prisma/client";

/**
 * Auto-detect a FileType enum from an upload's extension.
 * The admin UI never shows a manual file-type dropdown — type is derived here.
 */
const EXTENSION_MAP: Record<string, FileType> = {
  pdf: "PDF",
  mp3: "MP3",
  wav: "MP3",
  m4a: "MP3",
  mp4: "MP4",
  mov: "MP4",
  webm: "MP4",
  jpg: "JPG",
  jpeg: "JPG",
  png: "PNG",
  ppt: "PPT",
  pptx: "PPT",
  xls: "XLS",
  xlsx: "XLS",
  doc: "DOC",
  docx: "DOC",
};

export function detectFileType(filename: string): FileType | null {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  return EXTENSION_MAP[ext] ?? null;
}

/** Human label for a file-type badge (Excel/Word read nicer than XLS/DOC). */
export function fileTypeLabel(type: FileType): string {
  switch (type) {
    case "XLS":
      return "Excel";
    case "DOC":
      return "Word";
    case "PPT":
      return "PPT";
    default:
      return type;
  }
}

/** Badge colour per file type (from the design tokens). */
export const FILE_TYPE_COLOR: Record<FileType, string> = {
  PDF: "#B23B3B",
  MP3: "#7A5BB0",
  MP4: "#2C5F8A",
  JPG: "#3A7D44",
  PNG: "#3A7D44",
  PPT: "#C2701C",
  XLS: "#1F7A4D",
  DOC: "#2C5F8A",
};
