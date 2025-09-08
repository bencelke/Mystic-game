import './globals.css';
import './theme.css';
import type { Metadata } from 'next';
import { inter, cinzel } from './fonts';
import { MotionProvider } from '@/components/site/motion-provider';
import { AuthProvider } from '@/lib/auth/context';
import { Navbar } from '@/components/site/navbar';
import { Footer } from '@/components/site/footer';

export const metadata: Metadata = {
  title: 'Mystic — Parapsychology Arcade',
  description: 'Spin, draw, cast. Free rituals with XP, orbs, and collections.',
  manifest: '/manifest.json',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    viewportFit: 'cover',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${cinzel.variable} dark`}>
      <body className="min-h-screen flex flex-col">
        <MotionProvider>
          <AuthProvider>
            <Navbar />
            <main className="flex-1">
              <div className="mx-auto w-full max-w-screen-xl px-4 sm:px-6 lg:px-8">
                {children}
              </div>
            </main>
            <Footer />
          </AuthProvider>
        </MotionProvider>
      </body>
    </html>
  );
}
