"use client";

import { useEffect, useRef } from "react";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link2,
  RemoveFormatting,
} from "lucide-react";

/**
 * A lightweight contentEditable WYSIWYG. Emits HTML via onChange.
 * Deliberately dependency-free — bold/italic/underline, lists, link, clear.
 */
export function Wysiwyg({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  // Initialise once from value (uncontrolled thereafter to keep the caret stable).
  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value || "";
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function exec(command: string, arg?: string) {
    document.execCommand(command, false, arg);
    ref.current?.focus();
    emit();
  }

  function emit() {
    onChange(ref.current?.innerHTML ?? "");
  }

  function addLink() {
    const url = window.prompt("Link URL");
    if (url) exec("createLink", url);
  }

  const tools = [
    { icon: Bold, label: "Bold", action: () => exec("bold") },
    { icon: Italic, label: "Italic", action: () => exec("italic") },
    { icon: Underline, label: "Underline", action: () => exec("underline") },
    { icon: List, label: "Bullet list", action: () => exec("insertUnorderedList") },
    { icon: ListOrdered, label: "Numbered list", action: () => exec("insertOrderedList") },
    { icon: Link2, label: "Link", action: addLink },
    { icon: RemoveFormatting, label: "Clear formatting", action: () => exec("removeFormat") },
  ];

  return (
    <div className="overflow-hidden rounded-control border border-border-strong">
      <div className="flex items-center gap-1 border-b border-border bg-surface px-2 py-1.5">
        {tools.map((t, i) => {
          const Icon = t.icon;
          return (
            <button
              key={i}
              type="button"
              title={t.label}
              aria-label={t.label}
              onMouseDown={(e) => e.preventDefault()}
              onClick={t.action}
              className="inline-flex h-8 w-8 items-center justify-center rounded text-ink-muted hover:bg-white hover:text-ink"
            >
              <Icon size={16} />
            </button>
          );
        })}
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={emit}
        data-placeholder={placeholder}
        className="prose-portal min-h-[120px] px-3 py-2.5 text-base text-ink outline-none empty:before:text-ink-muted/70 empty:before:content-[attr(data-placeholder)]"
      />
    </div>
  );
}
