'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProgressBar } from '@/components/home/ProgressBar';
import { QuizModal } from '@/components/quiz/QuizModal';
import { PromptCard } from '@/components/journal/PromptCard';
import { pickWeakestItem, getOverallProgress } from '@/lib/progress/metrics';
import { pickPromptForRune, pickPromptForNumber, pickGenericPrompt, todayUTCKey } from '@/lib/journal/prompts';
import { tLearn, getCurrentLocale } from '@/lib/i18n/home';
import { cn } from '@/lib/utils';

export default function LearnPage() {
  const [weakestItem, setWeakestItem] = useState<any>(null);
  const [progress, setProgress] = useState<any>(null);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [reflectionPrompt, setReflectionPrompt] = useState('');
  const [reflectionKind, setReflectionKind] = useState<'rune' | 'number' | 'generic'>('generic');
  const [reflectionId, setReflectionId] = useState<string | number>('');
  const locale = getCurrentLocale();

  useEffect(() => {
    const weakest = pickWeakestItem();
    const prog = getOverallProgress();
    
    setWeakestItem(weakest);
    setProgress(prog);

    // Set up today's reflection
    if (weakest) {
      if (weakest.kind === 'rune') {
        setReflectionPrompt(pickPromptForRune(weakest.id as string, todayUTCKey()));
        setReflectionKind('rune');
        setReflectionId(weakest.id);
      } else {
        setReflectionPrompt(pickPromptForNumber(weakest.id, todayUTCKey()));
        setReflectionKind('number');
        setReflectionId(weakest.id);
      }
    } else {
      setReflectionPrompt(pickGenericPrompt(todayUTCKey()));
      setReflectionKind('generic');
      setReflectionId('');
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold tracking-wide text-foreground">
            {tLearn('title', {}, locale)}
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {tLearn('description', {}, locale)}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Resume Path */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-yellow-400 flex items-center gap-2">
                  <span className="text-xl">📚</span>
                  {tLearn('resumePath', {}, locale)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  {tLearn('noPath', {}, locale)}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Link href="/learn">
                    <Button 
                      variant="outline" 
                      className="w-full border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/10"
                    >
                      {tLearn('runeBasics', {}, locale)}
                    </Button>
                  </Link>
                  <Link href="/learn">
                    <Button 
                      variant="outline" 
                      className="w-full border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/10"
                    >
                      {tLearn('numerologyJourney', {}, locale)}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Suggested Quiz */}
            {weakestItem && (
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-yellow-400 flex items-center gap-2">
                    <span className="text-xl">🎯</span>
                    {tLearn('suggestedQuiz', {}, locale)}
                  </CardTitle>
                  <CardDescription>
                    {weakestItem.name} - {weakestItem.kind === 'rune' ? 'Rune' : 'Number'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => setIsQuizModalOpen(true)}
                    className="w-full bg-yellow-400 text-black hover:bg-yellow-300"
                  >
                    {tLearn('startQuiz', {}, locale)}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Today's Reflection */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-yellow-400 flex items-center gap-2">
                  <span className="text-xl">💭</span>
                  {tLearn('todaysReflection', {}, locale)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4 text-sm">
                  {reflectionPrompt}
                </p>
                {reflectionKind !== 'generic' && reflectionId ? (
                  <PromptCard
                    kind={reflectionKind}
                    ref={reflectionId}
                    prompt={reflectionPrompt}
                    existing=""
                    onSave={() => {
                      // Refresh the page to show updated state
                      window.location.reload();
                    }}
                  />
                ) : (
                  <Link href="/journal">
                    <Button 
                      variant="outline" 
                      className="w-full border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/10"
                    >
                      {tLearn('writeNote', {}, locale)}
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Progress Overview */}
          <div className="space-y-6">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-yellow-400 flex items-center gap-2">
                  <span className="text-xl">📊</span>
                  {tLearn('progressOverview', {}, locale)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Runes Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">
                      {tLearn('runesProgress', {}, locale)}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {progress?.runes.current || 0}/{progress?.runes.total || 24}
                    </span>
                  </div>
                  <ProgressBar 
                    value={progress?.runes.current || 0} 
                    max={progress?.runes.total || 24}
                    showLabel={false}
                  />
                </div>

                {/* Numbers Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">
                      {tLearn('numbersProgress', {}, locale)}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {progress?.numbers.current || 0}/{progress?.numbers.total || 11}
                    </span>
                  </div>
                  <ProgressBar 
                    value={progress?.numbers.current || 0} 
                    max={progress?.numbers.total || 11}
                    showLabel={false}
                  />
                </div>

                {/* Quiz Average */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">
                      {tLearn('quizAverage', {}, locale)}
                    </span>
                    <Badge variant="outline" className="text-yellow-400 border-yellow-500/30">
                      {progress?.quiz.bestAvg || 0}%
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {progress?.quiz.attempted || 0} quizzes attempted
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="pt-4 border-t border-border">
                  <div className="grid grid-cols-2 gap-2">
                    <Link href="/book">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/10"
                      >
                        Mystic Book
                      </Button>
                    </Link>
                    <Link href="/journal">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/10"
                      >
                        Journal
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quiz Modal */}
        {weakestItem && (
          <QuizModal
            open={isQuizModalOpen}
            onOpenChange={setIsQuizModalOpen}
            kind={weakestItem.kind}
            id={weakestItem.id}
            max={5}
          />
        )}
      </div>
    </div>
  );
}
