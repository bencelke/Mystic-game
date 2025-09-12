'use client';

import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useLocalPro } from '@/lib/pro/localPro';

export function LocalProSwitch() {
  const [pro, setPro] = useLocalPro();

  return (
    <div className="flex items-center space-x-3">
      <Switch
        id="local-pro"
        checked={pro}
        onCheckedChange={setPro}
        className="data-[state=checked]:bg-yellow-400"
      />
      <Label 
        htmlFor="local-pro" 
        className="text-sm font-medium text-foreground cursor-pointer"
      >
        Mystic Pro (local)
      </Label>
    </div>
  );
}
