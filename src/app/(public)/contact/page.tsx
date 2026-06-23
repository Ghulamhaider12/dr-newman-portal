export const metadata = { title: "Contact — Dr. Newman's Content Portal" };

export default function ContactPage() {
  return (
    <div className="container-narrow py-16">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
        Contact
      </p>
      <h1 className="mt-3 font-serif text-3xl font-semibold text-ink">
        Get in touch
      </h1>
      <div className="prose-portal mt-6 text-lg text-ink">
        <p>
          For questions about the work shared here, requests to reuse material,
          or to report an issue with a file, you are welcome to leave a comment
          on any item — Dr. Newman reviews each one personally.
        </p>
        <p>
          Comments left on a file page can be marked private if you would prefer
          your note not appear publicly.
        </p>
      </div>
    </div>
  );
}
