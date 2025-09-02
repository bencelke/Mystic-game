'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/lib/auth/context';
import { SignOut } from '@/components/auth/sign-out';
import { AuthModal } from '@/components/auth/auth-modal';
import { OrbHUD } from '@/components/orbs/orb-hud';
import { ProgressHUD } from '@/components/progression/progress-hud';

export function Navbar() {
  const [lang, setLang] = useState<'en' | 'ru'>('en');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user, loading } = useAuth();

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
          <Link href="/runes" className="mystic-link">
            Runes
          </Link>
          <Link href="/codex" className="mystic-link">
            Codex
          </Link>
          <Link href="/auth" className="mystic-link">
            Auth
          </Link>
        </nav>
                <div className="flex items-center gap-4">
          {/* Auth section */}
          {!loading && (
            <>
              {user ? (
                <>
                  {/* Progress HUD */}
                  <ProgressHUD user={user} />
                  {/* Orb HUD */}
                  <OrbHUD />
                  <SignOut />
                </>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="inline-flex items-center rounded-2xl border border-yellow-500/40 bg-mystic/50 px-4 py-2 shadow-glow hover:scale-[1.02] transition text-sm"
                >
                  Sign In
                </button>
              )}
            </>
          )}
          
          {/* Language switcher */}
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
      </div>
      
      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultMode="signin"
      />
    </header>
  );
}
