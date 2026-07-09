import { getSettings } from '@/lib/settings';

export const metadata = { title: "About — Dr. Newman's Content Portal" };
export const dynamic = 'force-dynamic';

export default async function AboutPage() {
  const settings = await getSettings();
  // Split the admin-editable text into paragraphs on blank lines so each block
  // renders as its own <p> (matching the original two-paragraph layout).
  const paragraphs = settings.about
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div className="container-narrow py-16">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">About</p>
      <h1 className="mt-3 font-serif text-3xl font-semibold text-ink">About Dr. Newman</h1>
      <div className="prose-portal mt-6 text-lg text-ink">
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </div>
  );
}
