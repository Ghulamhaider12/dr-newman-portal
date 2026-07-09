export const metadata = { title: "Contact — Dr. Newman's Content Portal" };

export default function ContactPage() {
  return (
    <div className="container-narrow py-16">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Contact</p>
      <h1 className="mt-3 font-serif text-3xl font-semibold text-ink">Get in touch</h1>
      <div className="prose-portal mt-6 text-lg text-ink">
        <p>
          The simplest way to reach Dr. Newman is to leave a comment on any of the materials here —
          a paper, an image, or a recording. Dr. Newman reads every comment personally.
        </p>
        <p>
          You do not need to enter your email address to leave a comment. Add it only if you would
          like to receive a reply. You can also mark any comment private if you would prefer it not
          appear publicly.
        </p>
      </div>
    </div>
  );
}
