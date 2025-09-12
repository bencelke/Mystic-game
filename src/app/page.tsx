'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MetricCard } from '@/components/home/MetricCard';
import { PillRow } from '@/components/home/PillRow';
import { dailyRuneLore, dailyNumberLore } from '@/lib/lore/daily';
import { getOverallProgress } from '@/lib/progress/metrics';
import { t, getCurrentLocale } from '@/lib/i18n/home';
import { cn } from '@/lib/utils';

export default function HomePage() {
  const [runeLore, setRuneLore] = useState<any>(null);
  const [numberLore, setNumberLore] = useState<any>(null);
  const [progress, setProgress] = useState<any>(null);
  const locale = getCurrentLocale();

  useEffect(() => {
    // Load daily lore
    const rune = dailyRuneLore();
    const number = dailyNumberLore();
    const prog = getOverallProgress();
    
    setRuneLore(rune);
    setNumberLore(number);
    setProgress(prog);
  }, []);

  const pills = [
    {
      title: t('runes', {}, locale),
      current: progress?.runes.current || 0,
      total: progress?.runes.total || 24,
      icon: 'ᚱ',
      href: '/book?tab=runes'
    },
    {
      title: t('numbers', {}, locale),
      current: progress?.numbers.current || 0,
      total: progress?.numbers.total || 11,
      icon: '🔢',
      href: '/book?tab=numbers'
    },
    {
      title: t('quizzes', {}, locale),
      current: progress?.quiz.attempted || 0,
      total: 35, // 24 runes + 11 numbers
      icon: '📝',
      href: '/learn',
      badge: `${progress?.quiz.bestAvg || 0}% ${t('bestAvg', {}, locale)}`
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-8 space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold tracking-wide text-foreground">
            {t('title', {}, locale)}
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            {t('subtitle', {}, locale)}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/arcade">
              <Button 
                size="lg" 
                className="bg-yellow-400 text-black hover:bg-yellow-300 px-8 py-3"
              >
                {t('openMystic', {}, locale)}
              </Button>
            </Link>
            <Link href="/book">
              <Button 
                size="lg" 
                variant="outline"
                className="border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/10 px-8 py-3"
              >
                {t('openMysticBook', {}, locale)}
              </Button>
            </Link>
          </div>
        </div>

        {/* Today Section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-foreground text-center">
            {t('today', {}, locale)}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Daily Rune */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-yellow-400 flex items-center gap-2">
                  <span className="text-2xl">ᚱ</span>
                  {t('dailyRune', {}, locale)}
                </CardTitle>
                <CardDescription>
                  {runeLore ? `${runeLore.name} (${runeLore.symbol})` : 'Loading...'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {runeLore && (
                  <>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {runeLore.loreShort}
                    </p>
                    <div className="flex items-center justify-between">
                      <Badge 
                        variant={runeLore.isUnlocked ? "default" : "secondary"}
                        className={runeLore.isUnlocked ? "bg-green-500 text-white" : ""}
                      >
                        {runeLore.isUnlocked ? t('unlocked', {}, locale) : t('locked', {}, locale)}
                      </Badge>
                      <Link href="/runes">
                        <Button size="sm" className="bg-yellow-400 text-black hover:bg-yellow-300">
                          {t('reveal', {}, locale)}
                        </Button>
                      </Link>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Daily Number */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-yellow-400 flex items-center gap-2">
                  <span className="text-2xl">🔢</span>
                  {t('dailyNumber', {}, locale)}
                </CardTitle>
                <CardDescription>
                  {numberLore ? `Number ${numberLore.id} - ${numberLore.name}` : 'Loading...'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {numberLore && (
                  <>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {numberLore.loreShort}
                    </p>
                    <div className="flex items-center justify-between">
                      <Badge 
                        variant={numberLore.isUnlocked ? "default" : "secondary"}
                        className={numberLore.isUnlocked ? "bg-green-500 text-white" : ""}
                      >
                        {numberLore.isUnlocked ? t('unlocked', {}, locale) : t('locked', {}, locale)}
                      </Badge>
                      <Link href="/numerology">
                        <Button size="sm" className="bg-yellow-400 text-black hover:bg-yellow-300">
                          {t('reveal', {}, locale)}
                        </Button>
                      </Link>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Progress Section */}
        <PillRow pills={pills} />

        {/* Continue Learning Section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-foreground text-center">
            {t('continueLearning', {}, locale)}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link href="/learn">
              <Card className="border-border bg-card hover:bg-card/80 transition-colors cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-yellow-400 flex items-center gap-2">
                    <span className="text-2xl">📖</span>
                    {t('startRuneBasics', {}, locale)}
                  </CardTitle>
                  <CardDescription>
                    Learn the fundamentals of Elder Futhark runes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/10">
                    Start Learning →
                  </Button>
                </CardContent>
              </Card>
            </Link>

            <Link href="/learn">
              <Card className="border-border bg-card hover:bg-card/80 transition-colors cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-yellow-400 flex items-center gap-2">
                    <span className="text-2xl">🔢</span>
                    {t('startNumerologyJourney', {}, locale)}
                  </CardTitle>
                  <CardDescription>
                    Discover the mystical meanings of numbers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/10">
                    Start Learning →
                  </Button>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}