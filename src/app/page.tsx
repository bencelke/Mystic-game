import Link from 'next/link';
import { Glow } from '@/components/ui/glow';

export default function HomePage() {
  return (
    <section className="relative">
      <Glow />
      <div className="mx-auto max-w-5xl px-4 py-20 text-center">
        <h1 className="text-4xl md:text-5xl font-bold tracking-wide">
          Enter the{' '}
          <span
            className="mystic-gold"
            style={{ fontFamily: 'var(--font-cinzel)' }}
          >
            Mystic Arcade
          </span>
        </h1>
        <p className="mt-4 text-gray-300 max-w-2xl mx-auto">
          Spin, draw, and cast: runes, tarot, numerology, affirmations. Earn XP,
          collect sigils, and grow your streak.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link
            href="/arcade"
            className="inline-flex items-center rounded-2xl border border-yellow-500/40 bg-mystic/50 px-6 py-3 shadow-glow hover:scale-[1.02] transition"
          >
            Enter the Arcade
          </Link>
          <Link
            href="/codex"
            className="inline-flex items-center rounded-2xl border border-yellow-500/20 px-6 py-3 hover:border-yellow-400/40 transition"
          >
            View Codex
          </Link>
        </div>
      </div>
    </section>
  );
}
