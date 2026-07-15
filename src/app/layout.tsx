import type { Metadata } from 'next';
import { Lora, Inter } from 'next/font/google';
import { SITE_ORIGIN } from '@/lib/site';
import './globals.css';

const lora = Lora({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-lora',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

// metadataBase makes every canonical/OG URL absolute against SITE_ORIGIN — so
// even when a scraper reverse-proxies our HTML on another hostname, the embedded
// <link rel="canonical"> still points search engines back to the real site.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_ORIGIN),
  title: 'advice4docs — Content Portal',
  description:
    "A personal archive of Dr. Newman's research, lectures, recordings, and writing — freely available to browse and download.",
};

// Runs synchronously before the page renders. If the site is being served on a
// hostname we don't recognise (i.e. a reverse-proxy mirror re-hosting our
// content), bounce the visitor to the real domain — this protects the /admin
// login from credential capture and keeps users on the canonical site.
const HOST_GUARD = `(function(){try{var ok=['advice4docs.com','www.advice4docs.com','localhost','127.0.0.1'];if(ok.indexOf(location.hostname)===-1){location.replace('https://advice4docs.com'+location.pathname+location.search+location.hash);}}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${lora.variable} ${inter.variable}`}>
      <body>
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script dangerouslySetInnerHTML={{ __html: HOST_GUARD }} />
        {children}
      </body>
    </html>
  );
}
