'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LogoMark } from '@/components/ui/Logo';

const LINKS = [
  { href: '/', label: 'Home' },
  { href: '/library', label: 'Library' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  function isActive(href: string) {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(href + '/');
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white/95 backdrop-blur">
      <div className="container-page flex h-[68px] items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <LogoMark className="h-9 w-9 text-lg" />
          <span className="font-serif text-xl font-semibold text-ink">advice4docs</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                'py-1 text-base transition-colors',
                isActive(l.href)
                  ? 'font-semibold text-primary [border-bottom:2px_solid_#2C5F8A]'
                  : 'text-ink hover:text-primary'
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <button
          className="inline-flex h-11 w-11 items-center justify-center rounded-control text-ink md:hidden"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <nav className="border-t border-border bg-white md:hidden">
          <div className="container-page flex flex-col py-2">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={cn(
                  'flex min-h-[44px] items-center text-base',
                  isActive(l.href) ? 'font-semibold text-primary' : 'text-ink'
                )}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
