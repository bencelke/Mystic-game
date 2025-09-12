'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { getJournalFeed, deleteJournalEntry, saveJournalEntry } from '@/lib/progress/local';
import { getRune } from '@/lib/content/runes';
import { getNumber } from '@/lib/content/numbers';
import { t, getCurrentLocale } from '@/lib/i18n/journal';
import { JournalEntry, JournalFeedOptions } from '@/types/journal';
import { cn } from '@/lib/utils';

interface FeedListProps {
  options?: JournalFeedOptions;
  className?: string;
}

export function FeedList({ options = {}, className }: FeedListProps) {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const locale = getCurrentLocale();

  useEffect(() => {
    const loadEntries = () => {
      const feedEntries = getJournalFeed(options);
      setEntries(feedEntries);
    };

    loadEntries();
  }, [options]);

  const handleEdit = (entry: JournalEntry) => {
    setEditingId(entry.id);
    setEditText(entry.text);
  };

  const handleSaveEdit = () => {
    if (!editingId || !editText.trim()) return;

    const entry = entries.find(e => e.id === editingId);
    if (!entry) return;

    saveJournalEntry({
      kind: entry.kind,
      ref: entry.ref,
      dateKey: entry.dateKey,
      prompt: entry.prompt,
      text: editText.trim(),
    });

    // Update local state
    setEntries(prev => prev.map(e => 
      e.id === editingId 
        ? { ...e, text: editText.trim(), updatedAt: Date.now() }
        : e
    ));

    setEditingId(null);
    setEditText('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('deleteConfirm', {}, locale))) return;

    setIsDeleting(id);
    
    try {
      deleteJournalEntry(id);
      
      // Fire analytics event
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('journal_delete', {
          detail: { id }
        }));
      }

      // Update local state
      setEntries(prev => prev.filter(e => e.id !== id));
    } catch (error) {
      console.error('Error deleting journal entry:', error);
    } finally {
      setIsDeleting(null);
    }
  };

  const formatDate = (dateKey: string) => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    if (dateKey === today) return t('today', {}, locale);
    if (dateKey === yesterday) return t('yesterday', {}, locale);
    return dateKey;
  };

  const getItemName = (entry: JournalEntry) => {
    if (entry.kind === 'rune') {
      const rune = getRune(entry.ref as any);
      return rune ? `${rune.name} (${rune.symbol})` : `Rune ${entry.ref}`;
    } else {
      const number = getNumber(parseInt(entry.ref) as any);
      return number ? `Number ${number.id} - ${number.name}` : `Number ${entry.ref}`;
    }
  };

  const getItemIcon = (entry: JournalEntry) => {
    if (entry.kind === 'rune') {
      const rune = getRune(entry.ref as any);
      return rune ? rune.symbol : 'ᚠ';
    } else {
      return '①';
    }
  };

  const truncateText = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (entries.length === 0) {
    return (
      <Card className={cn("border-border bg-card", className)}>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">{t('noEntries', {}, locale)}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {entries.map((entry) => (
        <Card key={entry.id} className="border-border bg-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl font-cinzel text-yellow-400">
                  {getItemIcon(entry)}
                </span>
                <div>
                  <CardTitle className="text-sm text-foreground">
                    {getItemName(entry)}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(entry.dateKey)}
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="text-xs">
                {entry.kind === 'rune' ? t('runes', {}, locale) : t('numbers', {}, locale)}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-3">
            <div>
              <h4 className="text-xs font-medium text-muted-foreground mb-1">
                {t('prompt', {}, locale)}:
              </h4>
              <p className="text-sm text-muted-foreground">
                {entry.prompt}
              </p>
            </div>

            {editingId === entry.id ? (
              <div className="space-y-2">
                <Textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="min-h-[100px]"
                  maxLength={2000}
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleSaveEdit}
                    size="sm"
                    className="bg-yellow-400 text-black hover:bg-yellow-300"
                  >
                    {t('save', {}, locale)}
                  </Button>
                  <Button
                    onClick={handleCancelEdit}
                    variant="outline"
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-sm text-foreground leading-relaxed">
                  {truncateText(entry.text)}
                </p>
                {entry.text.length > 150 && (
                  <Button
                    variant="link"
                    size="sm"
                    className="p-0 h-auto text-yellow-400 hover:text-yellow-300 mt-1"
                    onClick={() => setEditingId(entry.id)}
                  >
                    {t('view', {}, locale)}
                  </Button>
                )}
              </div>
            )}

            {editingId !== entry.id && (
              <div className="flex gap-2 pt-2">
                <Button
                  onClick={() => handleEdit(entry)}
                  variant="outline"
                  size="sm"
                >
                  {t('edit', {}, locale)}
                </Button>
                <Button
                  onClick={() => handleDelete(entry.id)}
                  variant="outline"
                  size="sm"
                  disabled={isDeleting === entry.id}
                  className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                >
                  {isDeleting === entry.id ? t('deleting', {}, locale) : t('delete', {}, locale)}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
