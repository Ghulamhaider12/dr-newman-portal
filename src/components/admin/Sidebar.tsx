'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  LayoutDashboard,
  FolderOpen,
  Tags,
  MessageSquare,
  Bell,
  Settings,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { CountBadge } from '@/components/ui/Badge';
import { LogoMark } from '@/components/ui/Logo';

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/files', label: 'File Management', icon: FolderOpen },
  { href: '/admin/categories', label: 'Categories', icon: Tags },
  {
    href: '/admin/comments',
    label: 'Comment Moderation',
    icon: MessageSquare,
    badgeKey: 'pending' as const,
  },
  { href: '/admin/notifications', label: 'Notifications', icon: Bell },
  { href: '/admin/settings', label: 'Site Settings', icon: Settings },
];

export function Sidebar({ pendingCount }: { pendingCount: number }) {
  const pathname = usePathname();

  function isActive(href: string, exact?: boolean) {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-border bg-surface">
      <div className="flex items-center gap-3 border-b border-border px-5 py-5">
        <LogoMark className="h-10 w-10 text-lg" />
        <div>
          <p className="font-serif text-lg font-semibold leading-tight text-ink">Dr. Newman</p>
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-muted">Admin</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {NAV.map((item) => {
          const active = isActive(item.href, item.exact);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex min-h-[44px] items-center gap-3 rounded-control px-3 text-sm font-medium transition-colors',
                active ? 'bg-primary-light text-primary' : 'text-ink hover:bg-white'
              )}
            >
              <Icon size={18} className={active ? 'text-primary' : 'text-ink-muted'} />
              <span className="flex-1">{item.label}</span>
              {item.badgeKey === 'pending' && <CountBadge count={pendingCount} />}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-3">
        <button
          onClick={() => signOut({ callbackUrl: '/admin/login' })}
          className="flex min-h-[44px] w-full items-center gap-3 rounded-control px-3 text-sm font-medium text-ink hover:bg-white"
        >
          <LogOut size={18} className="text-ink-muted" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
