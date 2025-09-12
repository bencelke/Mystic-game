'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FeedList } from '@/components/journal/FeedList';
import { getJournalFeed } from '@/lib/progress/local';
import { t, getCurrentLocale } from '@/lib/i18n/journal';
import { JournalFeedOptions } from '@/types/journal';

export default function JournalPage() {
  const [filterKind, setFilterKind] = useState<'all' | 'rune' | 'number'>('all');
  const [dateRange, setDateRange] = useState<'all' | '7days' | '30days'>('all');
  const [entries, setEntries] = useState<any[]>([]);
  const locale = getCurrentLocale();

  const loadEntries = () => {
    const options: JournalFeedOptions = {
      limit: 50,
    };

    if (filterKind !== 'all') {
      options.kind = filterKind;
    }

    if (dateRange !== 'all') {
      const today = new Date();
      const startDate = new Date(today);
      
      if (dateRange === '7days') {
        startDate.setDate(today.getDate() - 7);
      } else if (dateRange === '30days') {
        startDate.setDate(today.getDate() - 30);
      }

      options.dateRange = {
        start: startDate.toISOString().split('T')[0],
        end: today.toISOString().split('T')[0],
      };
    }

    const feedEntries = getJournalFeed(options);
    setEntries(feedEntries);
  };

  useEffect(() => {
    loadEntries();
  }, [filterKind, dateRange]);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {t('title', {}, locale)}
          </h1>
          <p className="text-muted-foreground">
            {t('description', {}, locale)}
          </p>
        </div>

        {/* Filters */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-yellow-400">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Type
                </label>
                <Select value={filterKind} onValueChange={(value: 'all' | 'rune' | 'number') => setFilterKind(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('all', {}, locale)}</SelectItem>
                    <SelectItem value="rune">{t('runes', {}, locale)}</SelectItem>
                    <SelectItem value="number">{t('numbers', {}, locale)}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Date Range
                </label>
                <Select value={dateRange} onValueChange={(value: 'all' | '7days' | '30days') => setDateRange(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('all', {}, locale)}</SelectItem>
                    <SelectItem value="7days">{t('last7Days', {}, locale)}</SelectItem>
                    <SelectItem value="30days">{t('last30Days', {}, locale)}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-foreground">Total Entries:</span>
              <span className="text-yellow-400 font-semibold">{entries.length}</span>
            </div>
          </CardContent>
        </Card>

        {/* Feed List */}
        <FeedList options={{ kind: filterKind === 'all' ? undefined : filterKind }} />
      </div>
    </div>
  );
}
