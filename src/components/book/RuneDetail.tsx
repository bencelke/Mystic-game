'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getRune } from '@/lib/content/runes';
import { isRuneUnlocked } from '@/lib/progress/local';
import { useLocalPro } from '@/lib/pro/localPro';
import { LockedHint } from '@/components/common/LockedHint';
import { QuizInline } from '@/components/quiz/QuizInline';
import { QuizStatsChip } from '@/components/quiz/QuizStatsChip';
import { getRuneQuiz } from '@/lib/quiz/loader';
import { PromptCard } from '@/components/journal/PromptCard';
import { FeedList } from '@/components/journal/FeedList';
import { EntryHeader } from './EntryHeader';
import { pickPromptForRune, todayUTCKey } from '@/lib/journal/prompts';
import { getJournalEntry, getRecentJournalEntries, markLoreRead, getLoreRead, updateNotesCount } from '@/lib/progress/local';
import { RuneId } from '@/content/runes-ids';
import { cn } from '@/lib/utils';

interface RuneDetailProps {
  id: RuneId;
  onClose?: () => void;
}

export function RuneDetail({ id, onClose }: RuneDetailProps) {
  const [pro] = useLocalPro();
  const rune = getRune(id);
  const isUnlocked = isRuneUnlocked(id);
  const hasQuiz = getRuneQuiz(id).length > 0;

  if (!rune) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">Rune not found</p>
        </CardContent>
      </Card>
    );
  }

  if (!isUnlocked) {
    return (
      <LockedHint
        title="Rune Locked"
        message="Discover this rune in a ritual to unlock its lore and wisdom."
        ctaLabel="How to unlock"
        href="/runes"
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Entry Header */}
      <EntryHeader
        kind="rune"
        id={id}
        name={rune.name}
        isUnlocked={isUnlocked}
      />
      
      {/* Symbol Display */}
      <div className="text-center">
        <div 
          className="text-6xl font-cinzel text-yellow-400"
          style={{ fontFamily: 'var(--font-cinzel)' }}
        >
          {rune.symbol}
        </div>
        {rune.altNames && rune.altNames.length > 0 && (
          <p className="text-sm text-muted-foreground mt-2">
            Also known as: {rune.altNames.join(', ')}
          </p>
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
              <CardTitle className="text-yellow-400">Meanings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-foreground mb-2">Upright</h4>
                <p className="text-muted-foreground">{rune.upright}</p>
              </div>
              
              {rune.reversed && (
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Reversed</h4>
                  <p className="text-muted-foreground italic">{rune.reversed}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {rune.keywords && rune.keywords.length > 0 && (
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-yellow-400">Keywords</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {rune.keywords.map((keyword, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {(rune.element || rune.phoneme) && (
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-yellow-400">Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {rune.element && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Element:</span>
                    <span className="text-foreground capitalize">{rune.element}</span>
                  </div>
                )}
                {rune.phoneme && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phoneme:</span>
                    <span className="text-foreground">{rune.phoneme}</span>
                  </div>
                )}
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
                {!getLoreRead('rune', id) && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      markLoreRead('rune', id);
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
                  {rune.loreFull && (
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">Full Lore</h4>
                      <p className="text-muted-foreground leading-relaxed">
                        {rune.loreFull}
                      </p>
                    </div>
                  )}
                  
                  {rune.history && (
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">History</h4>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {rune.history}
                      </p>
                    </div>
                  )}
                  
                  {rune.advice && (
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">Advice</h4>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {rune.advice}
                      </p>
                    </div>
                  )}
                  
                  {rune.shadow && (
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">Shadow Aspects</h4>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {rune.shadow}
                      </p>
                    </div>
                  )}
                  
                  {rune.ritualIdeas && rune.ritualIdeas.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">Ritual Ideas</h4>
                      <ul className="space-y-1">
                        {rune.ritualIdeas.map((idea, index) => (
                          <li key={index} className="text-muted-foreground text-sm">
                            • {idea}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {rune.loreShort && (
                    <div>
                      <p className="text-muted-foreground leading-relaxed">
                        {rune.loreShort}
                      </p>
                    </div>
                  )}
                  
                  <div className="p-4 rounded-lg bg-muted/50 border border-border">
                    <p className="text-sm text-muted-foreground text-center">
                      Unlock Mystic Pro to read full lore, history, and ritual ideas.
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
                kind="rune"
                ref={id}
                prompt={pickPromptForRune(id, todayUTCKey())}
                existing={getJournalEntry('rune', id, todayUTCKey())?.text || ''}
                onSave={(saved) => {
                  if (saved) {
                    // Update notes count
                    updateNotesCount('rune', id);
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
                  kind: 'rune',
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
                  <QuizStatsChip kind="rune" id={id} />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <QuizInline
                  kind="rune"
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
