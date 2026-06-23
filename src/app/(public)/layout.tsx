import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";
import { getSettings } from "@/lib/settings";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings();
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer copyright={settings.copyright} privacy={settings.privacy} />
    </div>
  );
}
