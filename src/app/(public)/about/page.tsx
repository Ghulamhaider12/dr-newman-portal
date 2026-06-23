export const metadata = { title: "About — Dr. Newman's Content Portal" };

export default function AboutPage() {
  return (
    <div className="container-narrow py-16">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
        About
      </p>
      <h1 className="mt-3 font-serif text-3xl font-semibold text-ink">
        About Dr. Newman
      </h1>
      <div className="prose-portal mt-6 text-lg text-ink">
        <p>
          Dr. A. Newman is a physician and researcher who has spent a career at
          the meeting point of medicine, art, and the written word. This portal
          is a personal library — a place to share research papers, lectures,
          recordings, and writing with students, colleagues, and anyone curious.
        </p>
        <p>
          Everything here is offered freely for educational and non-commercial
          use. If a piece is useful to you, please cite Dr. A. Newman and do not
          redistribute it without permission.
        </p>
      </div>
    </div>
  );
}
