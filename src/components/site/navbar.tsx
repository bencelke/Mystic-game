'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/context';
import { useAuthGate } from '@/lib/auth/useAuthGate';
import { AuthGateDialog } from '@/components/auth/auth-gate-dialog';
import { SignOut } from '@/components/auth/sign-out';
import { OrbHUD } from '@/components/orbs/orb-hud';
import { ProgressHUD } from '@/components/progression/progress-hud';
import { OnlineChip } from '@/components/presence/OnlineChip';
import { db } from '@/lib/firebase/client';
import { doc, getDoc } from 'firebase/firestore';
import { UserDoc } from '@/types/mystic';
import { Menu, X, User, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function Navbar() {
  const [lang, setLang] = useState<'en' | 'ru'>('en');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, loading } = useAuth();
  const [isPro, setIsPro] = useState(false);
  const { ensureAuthed, isOpen, onOpenChange, onAuthenticated } = useAuthGate();

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

  const navItems = [
    { href: '/', label: 'Home', icon: '🏠' },
    { href: '/arcade', label: 'Mystic', icon: '🔍' },
    { href: '/runes', label: 'Runes', icon: 'ᚱ' },
    { href: '/numerology', label: 'Numerology', icon: '🔢' },
    { href: '/book', label: 'Mystic Book', icon: '📚' },
    { href: '/learn', label: 'Learn', icon: '📖' },
    { href: '/journal', label: 'Journal', icon: '📝' },
    { href: '/settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <>
      {/* Main Navbar */}
      <header className="sticky top-0 z-50 border-b border-yellow-500/10 bg-gradient-to-b from-[#1b1036]/95 to-[#0a0717]/80 backdrop-blur">
        <div className="mx-auto max-w-screen-xl px-4 py-3">
          {/* Top Row: Logo + Actions */}
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="font-bold tracking-wide text-lg sm:text-xl flex items-center gap-2"
              style={{ fontFamily: 'var(--font-cinzel)' }}
            >
              <span className="text-yellow-400">Mystic</span>
              <span className="hidden sm:inline">Arcade</span>
              {isPro && (
                <Badge className="px-2 py-1 text-xs font-bold bg-yellow-400 text-black">
                  PRO
                </Badge>
              )}
            </Link>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {/* Auth Button */}
              {!loading && (
                <>
                  {user ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsMenuOpen(!isMenuOpen)}
                      className="h-10 w-10 p-0 text-foreground hover:bg-yellow-400/10"
                    >
                      <User className="h-5 w-5" />
                    </Button>
                  ) : (
                    <Button
                      onClick={ensureAuthed}
                      size="sm"
                      className="bg-yellow-400/10 border border-yellow-500/40 text-yellow-400 hover:bg-yellow-400/20"
                    >
                      Sign In
                    </Button>
                  )}
                </>
              )}

              {/* Language Switcher */}
              <div className="hidden sm:flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-8 px-2 text-xs ${
                    lang === 'en' ? 'bg-yellow-400/10 text-yellow-400' : 'text-foreground/70'
                  }`}
                  onClick={() => setLang('en')}
                >
                  EN
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-8 px-2 text-xs ${
                    lang === 'ru' ? 'bg-yellow-400/10 text-yellow-400' : 'text-foreground/70'
                  }`}
                  onClick={() => setLang('ru')}
                >
                  RU
                </Button>
              </div>
            </div>
          </div>

          {/* Mobile Navigation Tabs */}
          <div className="mt-3 md:hidden">
            <div className="flex overflow-x-auto no-scrollbar gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg bg-card border border-border text-foreground hover:bg-yellow-400/10 transition-colors"
                >
                  <span className="text-sm">{item.icon}</span>
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Secondary HUD Strip (Mobile) */}
      {user && (
        <div className="sticky top-[73px] z-40 bg-background/95 backdrop-blur border-b border-border md:hidden">
          <div className="mx-auto max-w-screen-xl px-4 py-2">
            <div className="flex overflow-x-auto no-scrollbar gap-2">
              <OnlineChip />
              <ProgressHUD user={user} />
              <OrbHUD />
            </div>
          </div>
        </div>
      )}

      {/* Desktop Navigation */}
      <nav className="hidden md:block sticky top-[73px] z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="mx-auto max-w-screen-xl px-4 py-3">
          <div className="flex items-center gap-6">
            {user && <OnlineChip />}
            {user && <ProgressHUD user={user} />}
            {user && <OrbHUD />}
            <div className="flex gap-6 text-sm">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-foreground hover:text-yellow-400 transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </div>
            {user && <SignOut />}
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && user && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur md:hidden">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">Account</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMenuOpen(false)}
                className="h-10 w-10 p-0"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex-1 p-4 space-y-4">
              <Link
                href="/account"
                className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border text-foreground hover:bg-yellow-400/10 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <User className="h-5 w-5" />
                <span>Account Settings</span>
              </Link>
              <SignOut />
            </div>
          </div>
        </div>
      )}
      
      {/* Auth Gate Dialog */}
      <AuthGateDialog
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        onAuthenticated={onAuthenticated}
      />
    </>
  );
}
