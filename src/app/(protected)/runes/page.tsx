'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DailyRunePanel } from '@/components/runes/daily-rune-panel';
import { Spread2Panel } from '@/components/runes/spread2-panel';
import { Spread3Panel } from '@/components/runes/spread3-panel';

export default function RunesPage() {
  return (
    <Tabs defaultValue="daily" className="w-full">
      <TabsList className="grid w-full grid-cols-3 bg-card border-border md:grid-cols-3">
        <TabsTrigger 
          value="daily" 
          className="text-foreground data-[state=active]:bg-yellow-400/10 data-[state=active]:text-yellow-400 min-h-[44px]"
        >
          Daily
        </TabsTrigger>
        <TabsTrigger 
          value="spread2" 
          className="text-foreground data-[state=active]:bg-yellow-400/10 data-[state=active]:text-yellow-400 min-h-[44px]"
        >
          Spread 2
        </TabsTrigger>
        <TabsTrigger 
          value="spread3" 
          className="text-foreground data-[state=active]:bg-yellow-400/10 data-[state=active]:text-yellow-400 min-h-[44px]"
        >
          Spread 3
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="daily" className="mt-4 md:mt-6">
        <DailyRunePanel />
      </TabsContent>
      
      <TabsContent value="spread2" className="mt-4 md:mt-6">
        <Spread2Panel />
      </TabsContent>
      
      <TabsContent value="spread3" className="mt-4 md:mt-6">
        <Spread3Panel />
      </TabsContent>
    </Tabs>
  );
}
