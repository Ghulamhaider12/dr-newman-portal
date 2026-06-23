import Link from "next/link";
import { Stethoscope, Palette, Library as LibraryIcon, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { publicUrl } from "@/lib/spaces";
import { ButtonLink } from "@/components/ui/Button";
import { FileCard, type FileCardData } from "@/components/public/FileCard";
import { categoryColor } from "@/lib/utils";

export const dynamic = "force-dynamic";

const CATEGORY_ICON = {
  medical: Stethoscope,
  art: Palette,
  other: LibraryIcon,
} as const;

export default async function HomePage() {
  const [settings, categories, recent] = await Promise.all([
    getSettings(),
    prisma.category.findMany({
      orderBy: { position: "asc" },
      include: { _count: { select: { files: true } } },
    }),
    prisma.file.findMany({
      orderBy: { dateUploaded: "desc" },
      take: 6,
      include: { category: { select: { name: true } } },
    }),
  ]);

  const bg = settings.background_photo
    ? publicUrl(settings.background_photo)
    : "";

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-primary text-white">
        {bg && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={bg}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-primary/80" />
          </>
        )}
        <div className="container-page relative py-24">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/80">
            Personal Library
          </p>
          <h1 className="mt-4 max-w-2xl font-serif text-4xl font-semibold leading-[1.1] text-white md:text-[3.25rem]">
            Medicine, art, and a life of inquiry
          </h1>
          <p className="mt-5 max-w-xl text-lg text-white/85">{settings.welcome}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/library" variant="success" size="lg">
              Browse the library
            </ButtonLink>
            <ButtonLink
              href="/library?sort=recent"
              variant="secondary"
              size="lg"
              className="border-white/30 bg-white text-ink"
            >
              Recent additions
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* Browse by category */}
      <section className="container-page py-16">
        <h2 className="font-serif text-2xl font-semibold text-ink">
          Browse by category
        </h2>
        <p className="mt-1 text-ink-muted">
          Find papers, talks, recordings, and writing by subject.
        </p>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => {
            const key = categoryColor(cat.name);
            const Icon = CATEGORY_ICON[key];
            return (
              <Link
                key={cat.id}
                href={`/library?category=${cat.id}`}
                className="group flex items-center gap-4 rounded-card border border-border bg-white p-6 shadow-card transition-all duration-200 ease-standard hover:-translate-y-0.5 hover:shadow-card-hover"
              >
                <span
                  className="flex h-12 w-12 items-center justify-center rounded-card"
                  style={{
                    backgroundColor:
                      key === "medical"
                        ? "#EBF3FA"
                        : key === "art"
                        ? "#E5F0F2"
                        : "#EEF1F5",
                    color:
                      key === "medical"
                        ? "#2C5F8A"
                        : key === "art"
                        ? "#4A90A4"
                        : "#5A6778",
                  }}
                >
                  <Icon size={22} />
                </span>
                <div className="flex-1">
                  <h3 className="font-serif text-xl font-semibold text-ink group-hover:text-primary">
                    {cat.name}
                  </h3>
                  <p className="text-sm text-ink-muted">
                    {cat._count.files}{" "}
                    {cat._count.files === 1 ? "item" : "items"}
                  </p>
                </div>
                <ArrowRight
                  size={18}
                  className="text-ink-muted transition-transform group-hover:translate-x-1"
                />
              </Link>
            );
          })}
        </div>
      </section>

      {/* Recent additions */}
      <section className="border-t border-border bg-surface">
        <div className="container-page py-16">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="font-serif text-2xl font-semibold text-ink">
                Recent additions
              </h2>
              <p className="mt-1 text-ink-muted">
                The latest items added to the library.
              </p>
            </div>
            <Link
              href="/library"
              className="hidden text-sm font-medium text-accent hover:text-accent-hover hover:underline sm:inline"
            >
              View all →
            </Link>
          </div>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recent.map((f) => (
              <FileCard key={f.id} file={f as unknown as FileCardData} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
