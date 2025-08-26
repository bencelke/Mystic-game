'use client';

import Link from 'next/link';
import { useState } from 'react';

export function Navbar() {
  const [lang, setLang] = useState<'en' | 'ru'>('en');

  return (
    <header className="sticky top-0 z-50 border-b border-yellow-500/10 bg-gradient-to-b from-[#1b1036]/95 to-[#0a0717]/80 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <Link
          href="/"
          className="font-bold tracking-wide text-xl"
          style={{ fontFamily: 'var(--font-cinzel)' }}
        >
          <span className="mystic-gold">Mystic</span> Arcade
        </Link>
        <nav className="hidden md:flex gap-6 text-sm">
          <Link href="/" className="mystic-link">
            Home
          </Link>
          <Link href="/arcade" className="mystic-link">
            Arcade
          </Link>
          <Link href="/codex" className="mystic-link">
            Codex
          </Link>
          <Link href="/account" className="mystic-link">
            Account
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <button
            className={`rounded-full px-3 py-1 text-xs border transition ${
              lang === 'en'
                ? 'border-yellow-400 text-yellow-300'
                : 'border-yellow-500/30 text-gray-300'
            }`}
            onClick={() => setLang('en')}
          >
            EN
          </button>
          <button
            className={`rounded-full px-3 py-1 text-xs border transition ${
              lang === 'ru'
                ? 'border-yellow-400 text-yellow-300'
                : 'border-yellow-500/30 text-gray-300'
            }`}
            onClick={() => setLang('ru')}
          >
            RU
          </button>
        </div>
      </div>
    </header>
  );
}
