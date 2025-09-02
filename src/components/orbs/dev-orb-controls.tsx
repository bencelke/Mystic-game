'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth/context';
import { spendOrbsAction, grantOrbAction } from '@/app/(protected)/orbs/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export const DevOrbControls = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<any>(null);

  // Only show for authenticated users in development
  if (!user || process.env.NODE_ENV === 'production') {
    return null;
  }

  const handleSpendOrb = async (amount: number = 1) => {
    setIsLoading(true);
    setLastAction(`Spending ${amount} orb(s)...`);
    
    try {
      const result = await spendOrbsAction(amount);
      
      if (result.success) {
        setLastAction(`✅ Spent ${amount} orb(s)`);
        setLastResult(result.data);
      } else {
        setLastAction(`❌ Failed: ${result.error}`);
        setLastResult(null);
      }
    } catch (error) {
      setLastAction(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setLastResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGrantOrb = async () => {
    setIsLoading(true);
    setLastAction('Granting 1 orb...');
    
    try {
      const result = await grantOrbAction();
      
      if (result.success) {
        setLastAction('✅ Granted 1 orb');
        setLastResult(result.data);
      } else {
        setLastAction(`❌ Failed: ${result.error}`);
        setLastResult(null);
      }
    } catch (error) {
      setLastAction(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setLastResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-amber-500/40 bg-amber-500/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-amber-600">
          <span className="text-sm">🧪</span>
          DEV: Orb System Controls
        </CardTitle>
        <CardDescription className="text-amber-600/80">
          Development-only controls for testing the orb system. These will be removed in production.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => handleSpendOrb(1)}
            disabled={isLoading}
            variant="outline"
            size="sm"
            className="border-amber-500/40 text-amber-600 hover:bg-amber-500/10"
          >
            Spend 1 Orb
          </Button>
          
          <Button
            onClick={() => handleSpendOrb(2)}
            disabled={isLoading}
            variant="outline"
            size="sm"
            className="border-amber-500/40 text-amber-600 hover:bg-amber-500/10"
          >
            Spend 2 Orbs
          </Button>
          
          <Button
            onClick={handleGrantOrb}
            disabled={isLoading}
            variant="outline"
            size="sm"
            className="border-amber-500/40 text-amber-600 hover:bg-amber-500/10"
          >
            Grant 1 Orb
          </Button>
        </div>

        {/* Status Display */}
        {lastAction && (
          <div className="space-y-2">
            <Separator className="bg-amber-500/20" />
            
            <div className="text-sm">
              <span className="font-medium text-amber-600">Last Action:</span>
              <span className="ml-2 text-foreground">{lastAction}</span>
            </div>
            
            {lastResult && (
              <div className="text-sm space-y-1">
                <span className="font-medium text-amber-600">Result:</span>
                <div className="ml-2 space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      Current: {lastResult.current}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Max: {lastResult.max}
                    </Badge>
                    {lastResult.spent && (
                      <Badge variant="outline" className="text-xs">
                        Spent: {lastResult.spent}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="text-xs text-muted-foreground bg-muted/20 p-3 rounded-md">
          <p className="font-medium mb-1">Testing Instructions:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Click "Spend 1 Orb" to test orb consumption</li>
            <li>Watch the navbar HUD update in real-time</li>
            <li>Wait for regeneration or use "Grant 1 Orb" to restore</li>
            <li>Check browser console for detailed logs</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
