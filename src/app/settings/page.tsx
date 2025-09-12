'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LocalProSwitch } from '@/components/settings/LocalProSwitch';
import { Badge } from '@/components/ui/badge';
import { Info } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
          <p className="text-muted-foreground">Manage your Mystic experience</p>
        </div>

        {/* Pro Settings */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-yellow-400 flex items-center gap-2">
              <Badge className="bg-yellow-400 text-black text-xs">DEV</Badge>
              Pro Features
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <LocalProSwitch />
                <p className="text-xs text-muted-foreground">
                  Unlock full lore content and advanced features
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 border border-border">
              <Info className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="text-xs text-muted-foreground">
                <p className="font-medium mb-1">Local-only toggle for development</p>
                <p>No billing or external services. This toggle persists in your browser's localStorage.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Coming Soon */}
        <Card className="border-dashed border-border">
          <CardContent className="text-center py-8">
            <h3 className="text-lg font-semibold text-muted-foreground mb-2">
              More Settings Coming Soon
            </h3>
            <p className="text-muted-foreground text-sm">
              Theme preferences, notification settings, and more
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
