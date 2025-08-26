import './globals.css';
import type { Metadata } from 'next';
import { inter, cinzel } from './fonts';
import { MotionProvider } from '@/components/site/motion-provider';
import { Navbar } from '@/components/site/navbar';
import { Footer } from '@/components/site/footer';

export const metadata: Metadata = {
  title: 'Mystic — Parapsychology Arcade',
  description: 'Spin, draw, cast. Free rituals with XP, orbs, and collections.',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${cinzel.variable}`}>
      <body className="min-h-screen flex flex-col">
        <MotionProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </MotionProvider>
      </body>
    </html>
  );
}
