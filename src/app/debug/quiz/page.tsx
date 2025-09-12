'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { QuizInline } from '@/components/quiz/QuizInline';
import { QuizModal } from '@/components/quiz/QuizModal';
import { getAvailableRuneQuizIds, getAvailableNumberQuizIds } from '@/lib/quiz/loader';
import { resetProgress, getLocalXP } from '@/lib/progress/local';
import { getRune } from '@/lib/content/runes';
import { getNumber } from '@/lib/content/numbers';
import { ELDER_FUTHARK_IDS } from '@/content/runes-ids';
import { NUMEROLOGY_IDS } from '@/content/numbers-ids';

export default function QuizDebugPage() {
  const [selectedKind, setSelectedKind] = useState<'rune' | 'number'>('rune');
  const [selectedId, setSelectedId] = useState<string>('');
  const [showInline, setShowInline] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const runeIds = getAvailableRuneQuizIds();
  const numberIds = getAvailableNumberQuizIds();
  const currentXP = getLocalXP();

  const handleReset = () => {
    resetProgress();
    window.location.reload();
  };

  const getItemName = () => {
    if (selectedKind === 'rune') {
      const rune = getRune(selectedId as any);
      return rune ? `${rune.name} (${rune.symbol})` : selectedId;
    } else {
      const number = getNumber(parseInt(selectedId) as any);
      return number ? `Number ${number.id} - ${number.name}` : selectedId;
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">Quiz Debug Page</h1>
          <p className="text-muted-foreground">Test quiz functionality and content</p>
        </div>

        {/* XP Display */}
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-foreground">Current XP:</span>
              <Badge className="bg-yellow-400 text-black">
                {currentXP} XP
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Quiz Selector */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-yellow-400">Quiz Selector</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Quiz Type
                </label>
                <Select value={selectedKind} onValueChange={(value: 'rune' | 'number') => setSelectedKind(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rune">Runes</SelectItem>
                    <SelectItem value="number">Numbers</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  {selectedKind === 'rune' ? 'Rune' : 'Number'}
                </label>
                <Select value={selectedId} onValueChange={setSelectedId}>
                  <SelectTrigger>
                    <SelectValue placeholder={`Select a ${selectedKind}...`} />
                  </SelectTrigger>
                  <SelectContent>
                    {(selectedKind === 'rune' ? runeIds : numberIds).map((id) => (
                      <SelectItem key={id} value={id}>
                        {selectedKind === 'rune' ? (
                          (() => {
                            const rune = getRune(id as any);
                            return rune ? `${rune.name} (${rune.symbol})` : id;
                          })()
                        ) : (
                          (() => {
                            const number = getNumber(parseInt(id) as any);
                            return number ? `Number ${number.id} - ${number.name}` : id;
                          })()
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {selectedId && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Selected: <span className="text-foreground font-medium">{getItemName()}</span>
                </p>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => setShowInline(true)}
                    disabled={!selectedId}
                    className="bg-yellow-400 text-black hover:bg-yellow-300"
                  >
                    Test Inline Quiz
                  </Button>
                  <Button 
                    onClick={() => setShowModal(true)}
                    disabled={!selectedId}
                    variant="outline"
                  >
                    Test Modal Quiz
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Inline Quiz */}
        {showInline && selectedId && (
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-yellow-400">Inline Quiz Test</CardTitle>
            </CardHeader>
            <CardContent>
              <QuizInline
                kind={selectedKind}
                id={selectedId}
                max={3}
                onFinish={(result) => {
                  console.log('Quiz finished:', result);
                }}
              />
            </CardContent>
          </Card>
        )}

        {/* Modal Quiz */}
        <QuizModal
          open={showModal}
          onOpenChange={setShowModal}
          kind={selectedKind}
          id={selectedId}
          max={3}
        />

        {/* Reset Button */}
        <Card className="border-dashed border-border">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold text-muted-foreground mb-2">
              Reset Local Progress
            </h3>
            <p className="text-muted-foreground text-sm mb-4">
              This will clear all quiz progress and XP. Use with caution!
            </p>
            <Button 
              onClick={handleReset}
              variant="destructive"
            >
              Reset All Progress
            </Button>
          </CardContent>
        </Card>

        {/* Content Stats */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-yellow-400">Content Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-foreground mb-2">Runes</h4>
                <p className="text-sm text-muted-foreground">
                  Total runes: {ELDER_FUTHARK_IDS.length}
                </p>
                <p className="text-sm text-muted-foreground">
                  Quiz content: {runeIds.length}
                </p>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-2">Numbers</h4>
                <p className="text-sm text-muted-foreground">
                  Total numbers: {NUMEROLOGY_IDS.length}
                </p>
                <p className="text-sm text-muted-foreground">
                  Quiz content: {numberIds.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
