'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DailyNumberPanel } from '@/components/numerology/daily-number-panel';
import { DeepReadingPanel } from '@/components/numerology/deep-reading-panel';
import { CompatibilityPanel } from '@/components/numerology/compatibility-panel';

export default function NumerologyPage() {
  return (
    <Tabs defaultValue="daily" className="w-full">
      <TabsList className="grid w-full grid-cols-3 bg-card border-border">
        <TabsTrigger 
          value="daily" 
          className="text-foreground data-[state=active]:bg-yellow-400/10 data-[state=active]:text-yellow-400 min-h-[44px] text-xs sm:text-sm"
        >
          Daily
        </TabsTrigger>
        <TabsTrigger 
          value="deep" 
          className="text-foreground data-[state=active]:bg-yellow-400/10 data-[state=active]:text-yellow-400 min-h-[44px] text-xs sm:text-sm"
        >
          Deep Reading
        </TabsTrigger>
        <TabsTrigger 
          value="compat" 
          className="text-foreground data-[state=active]:bg-yellow-400/10 data-[state=active]:text-yellow-400 min-h-[44px] text-xs sm:text-sm"
        >
          Compatibility
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="daily" className="mt-4 md:mt-6">
        <DailyNumberPanel />
      </TabsContent>
      
      <TabsContent value="deep" className="mt-4 md:mt-6">
        <DeepReadingPanel />
      </TabsContent>
      
      <TabsContent value="compat" className="mt-4 md:mt-6">
        <CompatibilityPanel />
      </TabsContent>
    </Tabs>
  );
}