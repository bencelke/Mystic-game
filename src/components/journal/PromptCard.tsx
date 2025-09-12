'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { saveJournalEntry, canSaveJournal, getJournalEntry } from '@/lib/progress/local';
import { getLocalPro } from '@/lib/pro/localPro';
import { t, getCurrentLocale } from '@/lib/i18n/journal';
import { cn } from '@/lib/utils';

interface PromptCardProps {
  kind: 'rune' | 'number';
  ref: string | number;
  prompt: string;
  existing?: string;
  onSave?: (saved: boolean) => void;
  className?: string;
}

const MAX_CHARS = 2000;

export function PromptCard({ 
  kind, 
  ref, 
  prompt, 
  existing = '', 
  onSave,
  className 
}: PromptCardProps) {
  const [text, setText] = useState(existing);
  const [isSaving, setIsSaving] = useState(false);
  const [isPro] = getLocalPro();
  const locale = getCurrentLocale();

  // Load existing entry on mount
  useEffect(() => {
    if (existing) {
      setText(existing);
    }
  }, [existing]);

  const handleSave = async () => {
    if (!text.trim()) return;

    setIsSaving(true);
    
    try {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      
      // Check if user can save (Pro gating)
      const canSave = canSaveJournal({ kind, dateKey: today });
      
      if (!canSave.ok) {
        // Show Pro upsell
        alert(t('proLimit', {}, locale));
        setIsSaving(false);
        return;
      }

      // Save the entry
      saveJournalEntry({
        kind,
        ref: String(ref),
        dateKey: today,
        prompt,
        text: text.trim(),
      });

      // Fire analytics event
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('journal_save', {
          detail: { kind, ref, dateKey: today, length: text.length }
        }));
      }

      // Show success message
      alert(t('saved', {}, locale));
      
      onSave?.(true);
    } catch (error) {
      console.error('Error saving journal entry:', error);
      alert(t('savedError', {}, locale));
    } finally {
      setIsSaving(false);
    }
  };

  const handleClear = () => {
    setText('');
  };

  const canSave = text.trim().length > 0 && text.length <= MAX_CHARS && !isSaving;

  return (
    <Card className={cn("border-border bg-card", className)}>
      <CardHeader>
        <CardTitle className="text-yellow-400 flex items-center gap-2">
          {t('reflection', {}, locale)}
          {!isPro && (
            <Badge variant="outline" className="text-xs">
              Free
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-foreground mb-2">
            {t('prompt', {}, locale)}:
          </h4>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {prompt}
          </p>
        </div>

        <div className="space-y-2">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Share your thoughts..."
            className="min-h-[100px] resize-none"
            maxLength={MAX_CHARS}
            aria-label={t('entry', {}, locale)}
          />
          
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <span>
              {t('charCount', { current: text.length, max: MAX_CHARS }, locale)}
            </span>
            {text.length > MAX_CHARS * 0.9 && (
              <span className="text-yellow-400">
                {MAX_CHARS - text.length} characters remaining
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleSave}
            disabled={!canSave}
            className="flex-1 bg-yellow-400 text-black hover:bg-yellow-300 disabled:opacity-50"
          >
            {isSaving ? t('saving', {}, locale) : t('save', {}, locale)}
          </Button>
          
          {text && (
            <Button
              onClick={handleClear}
              variant="outline"
              disabled={isSaving}
              className="border-red-500/30 text-red-400 hover:bg-red-500/10"
            >
              {t('clear', {}, locale)}
            </Button>
          )}
        </div>

        {!isPro && (
          <div className="p-3 rounded-lg bg-muted/50 border border-border">
            <p className="text-xs text-muted-foreground text-center">
              Free users can save one reflection per day per type. 
              <br />
              <Button 
                variant="link" 
                size="sm" 
                className="p-0 h-auto text-yellow-400 hover:text-yellow-300"
                onClick={() => window.location.href = '/settings'}
              >
                {t('proUpsell', {}, locale)}
              </Button>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
