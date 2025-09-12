'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getNumber } from '@/lib/content/numbers';
import { isNumberUnlocked } from '@/lib/progress/local';
import { useLocalPro } from '@/lib/pro/localPro';
import { LockedHint } from '@/components/common/LockedHint';
import { QuizInline } from '@/components/quiz/QuizInline';
import { QuizStatsChip } from '@/components/quiz/QuizStatsChip';
import { getNumberQuiz } from '@/lib/quiz/loader';
import { PromptCard } from '@/components/journal/PromptCard';
import { FeedList } from '@/components/journal/FeedList';
import { EntryHeader } from './EntryHeader';
import { pickPromptForNumber, todayUTCKey } from '@/lib/journal/prompts';
import { getJournalEntry, getRecentJournalEntries, markLoreRead, getLoreRead, updateNotesCount } from '@/lib/progress/local';
import { NumberId } from '@/content/numbers-ids';

interface NumberDetailProps {
  id: NumberId;
  onClose?: () => void;
}

export function NumberDetail({ id, onClose }: NumberDetailProps) {
  const [pro] = useLocalPro();
  const number = getNumber(id);
  const isUnlocked = isNumberUnlocked(id);
  const hasQuiz = getNumberQuiz(id).length > 0;

  if (!number) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">Number not found</p>
        </CardContent>
      </Card>
    );
  }

  if (!isUnlocked) {
    return (
      <LockedHint
        title="Number Locked"
        message="Discover this number in a numerology ritual to unlock its wisdom and meaning."
        ctaLabel="How to unlock"
        href="/numerology"
      />
    );
  }

  const isMasterNumber = id === 11 || id === 22;

  return (
    <div className="space-y-6">
      {/* Entry Header */}
      <EntryHeader
        kind="number"
        id={id}
        name={number.name}
        isUnlocked={isUnlocked}
      />
      
      {/* Number Display */}
      <div className="text-center">
        <div 
          className="text-6xl font-bold text-yellow-400"
          style={{ fontFamily: 'var(--font-cinzel)' }}
        >
          {number.id}
        </div>
        {isMasterNumber && (
          <Badge className="bg-yellow-400 text-black text-xs mt-2">
            Master Number
          </Badge>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className={`grid w-full ${hasQuiz ? 'grid-cols-4' : 'grid-cols-3'}`}>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="lore">Lore</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          {hasQuiz && <TabsTrigger value="quiz">Quiz</TabsTrigger>}
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-yellow-400">Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {number.overview}
              </p>
            </CardContent>
          </Card>

          {number.keywords && number.keywords.length > 0 && (
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-yellow-400">Keywords</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {number.keywords.map((keyword, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="lore" className="space-y-4">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-yellow-400 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  Lore
                  {pro && (
                    <Badge className="bg-yellow-400 text-black text-xs">Pro</Badge>
                  )}
                </div>
                {!getLoreRead('number', id) && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      markLoreRead('number', id);
                      // Refresh the page to show updated state
                      window.location.reload();
                    }}
                    className="border-green-500/30 text-green-400 hover:bg-green-500/10"
                  >
                    I've Read This
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {pro ? (
                <div className="space-y-4">
                  {number.loreFull && (
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">Full Lore</h4>
                      <p className="text-muted-foreground leading-relaxed">
                        {number.loreFull}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {number.loreShort && (
                    <div>
                      <p className="text-muted-foreground leading-relaxed">
                        {number.loreShort}
                      </p>
                    </div>
                  )}
                  
                  <div className="p-4 rounded-lg bg-muted/50 border border-border">
                    <p className="text-sm text-muted-foreground text-center">
                      Unlock Mystic Pro to read full lore and deeper meanings.
                    </p>
                    <div className="mt-3 text-center">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.location.href = '/settings'}
                      >
                        Upgrade to Pro
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notes" className="space-y-4">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-yellow-400">Today's Reflection</CardTitle>
            </CardHeader>
            <CardContent>
              <PromptCard
                kind="number"
                ref={id}
                prompt={pickPromptForNumber(id, todayUTCKey())}
                existing={getJournalEntry('number', String(id), todayUTCKey())?.text || ''}
                onSave={(saved) => {
                  if (saved) {
                    // Update notes count
                    updateNotesCount('number', id);
                    // Refresh the component to show updated state
                    window.location.reload();
                  }
                }}
              />
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-yellow-400">Recent Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <FeedList 
                options={{ 
                  kind: 'number',
                  limit: 3
                }} 
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        {hasQuiz && (
          <TabsContent value="quiz" className="space-y-4">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-yellow-400 flex items-center justify-between">
                  Quiz
                  <QuizStatsChip kind="number" id={id} />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <QuizInline
                  kind="number"
                  id={id}
                  max={5}
                  onFinish={(result) => {
                    console.log('Quiz completed:', result);
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
