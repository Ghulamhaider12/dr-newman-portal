import { prisma } from '@/lib/prisma';
import { getSettings } from '@/lib/settings';
import { publicUrl } from '@/lib/spaces';
import { PageHeader } from '@/components/admin/PageHeader';
import { SettingsForm } from '@/components/admin/SettingsForm';

export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
  const [settings, pending] = await Promise.all([
    getSettings(),
    prisma.comment.count({ where: { isApproved: null } }),
  ]);

  const backgroundUrl = settings.background_photo ? publicUrl(settings.background_photo) : '';
  const recentBackgroundUrl = settings.recent_background_photo
    ? publicUrl(settings.recent_background_photo)
    : '';

  return (
    <>
      <PageHeader
        title="Site Settings"
        subtitle="Edit site copy and the homepage background photo."
        pendingCount={pending}
      />
      <div className="p-8">
        <SettingsForm
          initial={settings}
          backgroundUrl={backgroundUrl}
          recentBackgroundUrl={recentBackgroundUrl}
        />
      </div>
    </>
  );
}
