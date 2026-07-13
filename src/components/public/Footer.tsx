import Link from 'next/link';
import { LogoMark } from '@/components/ui/Logo';

export function Footer({ copyright, privacy }: { copyright: string; privacy: string }) {
  return (
    <footer className="mt-auto border-t border-border bg-surface">
      <div className="container-page flex flex-col gap-6 py-12 md:flex-row md:items-start md:justify-between">
        <div className="max-w-md">
          <div className="flex items-center gap-3">
            <LogoMark className="h-8 w-8 text-base" />
            <span className="font-serif text-lg font-semibold text-ink">advice4docs</span>
          </div>
          <p className="mt-3 text-sm text-ink-muted">{copyright}</p>
        </div>
        <div className="flex flex-col gap-2 text-sm">
          <span className="font-semibold uppercase tracking-[0.04em] text-ink-muted">Browse</span>
          <Link href="/library" className="text-accent hover:text-accent-hover hover:underline">
            Content library
          </Link>
          <Link href="/about" className="text-accent hover:text-accent-hover hover:underline">
            About Dr. Newman
          </Link>
          <Link href="/contact" className="text-accent hover:text-accent-hover hover:underline">
            Contact
          </Link>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="container-page py-4">
          <p className="text-xs text-ink-muted">{privacy}</p>
        </div>
      </div>
    </footer>
  );
}
