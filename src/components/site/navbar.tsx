'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/context';
import { SignOut } from '@/components/auth/sign-out';
import { OrbHUD } from '@/components/orbs/orb-hud';
import { ProgressHUD } from '@/components/progression/progress-hud';
import { OnlineChip } from '@/components/presence/OnlineChip';
import { db } from '@/lib/firebase/client';
import { doc, getDoc } from 'firebase/firestore';
import { UserDoc } from '@/types/mystic';

export function Navbar() {
  const [lang, setLang] = useState<'en' | 'ru'>('en');
  const { user, loading } = useAuth();
  const [isPro, setIsPro] = useState(false);

  // Load user's Pro status
  useEffect(() => {
    if (user) {
      loadProStatus();
    } else {
      setIsPro(false);
    }
  }, [user]);

  const loadProStatus = async () => {
    if (!user) return;
    
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data() as UserDoc;
        setIsPro(userData.proEntitlement || false);
      }
    } catch (error) {
      console.error('Error loading Pro status:', error);
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-yellow-500/10 bg-gradient-to-b from-[#1b1036]/95 to-[#0a0717]/80 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <Link
          href="/"
          className="font-bold tracking-wide text-xl flex items-center gap-2"
          style={{ fontFamily: 'var(--font-cinzel)' }}
        >
          <span className="mystic-gold">Mystic</span> Arcade
          {isPro && (
            <span className="px-2 py-1 text-xs font-bold bg-yellow-400 text-black rounded-full">
              PRO
            </span>
          )}
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
          {/* Online presence chip */}
          {user && <OnlineChip />}
          
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
                <Link
                  href="/auth"
                  className="inline-flex items-center rounded-2xl border border-yellow-500/40 bg-mystic/50 px-4 py-2 shadow-glow hover:scale-[1.02] transition text-sm"
                >
                  Sign In
                </Link>
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
    </header>
  );
}
