import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { updateFeaturesConfigAction, getFeaturesConfigAction } from './actions';
import { toast } from 'sonner';

// Server component to get current features config
async function getCurrentConfig() {
  try {
    const result = await getFeaturesConfigAction();
    return result.success ? result.config : null;
  } catch (error) {
    console.error('Error getting features config:', error);
    return null;
  }
}

export default async function FeaturesConfigPage() {
  const config = await getCurrentConfig();

  if (!config) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Features Configuration</h1>
          <p className="text-muted-foreground mt-2">
            Manage system features and settings
          </p>
        </div>
        <Card className="border-border bg-card">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Failed to load configuration</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Features Configuration</h1>
        <p className="text-muted-foreground mt-2">
          Manage system features and settings
        </p>
      </div>

      {/* Features Config Form */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-xl text-foreground">System Features</CardTitle>
          <CardDescription className="text-muted-foreground">
            Enable or disable various system features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updateFeaturesConfigAction} className="space-y-6">
            {/* Watch-to-Earn Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Watch-to-Earn Settings</h3>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="watchToEarnEnabled" className="text-foreground">
                    Enable Watch-to-Earn
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Allow users to watch ads for rewards
                  </p>
                </div>
                <Switch
                  id="watchToEarnEnabled"
                  name="watchToEarnEnabled"
                  defaultChecked={config.watchToEarnEnabled}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="watchCooldownMin" className="text-foreground">
                    Cooldown (minutes)
                  </Label>
                  <Input
                    id="watchCooldownMin"
                    name="watchCooldownMin"
                    type="number"
                    min="1"
                    max="1440"
                    defaultValue={config.watchCooldownMin}
                    className="bg-background border-border text-foreground"
                  />
                  <p className="text-xs text-muted-foreground">
                    Time between ad watches (1-1440 minutes)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="watchDailyLimit" className="text-foreground">
                    Daily Limit
                  </Label>
                  <Input
                    id="watchDailyLimit"
                    name="watchDailyLimit"
                    type="number"
                    min="1"
                    max="100"
                    defaultValue={config.watchDailyLimit}
                    className="bg-background border-border text-foreground"
                  />
                  <p className="text-xs text-muted-foreground">
                    Maximum ads per day (1-100)
                  </p>
                </div>
              </div>
            </div>

            {/* Feature Toggles */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Feature Toggles</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="dailyRitualEnabled" className="text-foreground">
                      Daily Rituals
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Allow users to perform daily rituals
                    </p>
                  </div>
                  <Switch
                    id="dailyRitualEnabled"
                    name="dailyRitualEnabled"
                    defaultChecked={config.dailyRitualEnabled}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="proFeaturesEnabled" className="text-foreground">
                      Pro Features
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Enable Pro subscription features
                    </p>
                  </div>
                  <Switch
                    id="proFeaturesEnabled"
                    name="proFeaturesEnabled"
                    defaultChecked={config.proFeaturesEnabled}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="socialFeaturesEnabled" className="text-foreground">
                      Social Features
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Enable social interactions and sharing
                    </p>
                  </div>
                  <Switch
                    id="socialFeaturesEnabled"
                    name="socialFeaturesEnabled"
                    defaultChecked={config.socialFeaturesEnabled}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="offlineModeEnabled" className="text-foreground">
                      Offline Mode
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Allow offline gameplay
                    </p>
                  </div>
                  <Switch
                    id="offlineModeEnabled"
                    name="offlineModeEnabled"
                    defaultChecked={config.offlineModeEnabled}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="inlineWheelEnabled" className="text-foreground">
                      Inline Wheel Widget
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Show wheel widget in ritual panels
                    </p>
                  </div>
                  <Switch
                    id="inlineWheelEnabled"
                    name="inlineWheelEnabled"
                    defaultChecked={config.inlineWheelEnabled}
                  />
                </div>
              </div>
            </div>

            {/* Pro Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Pro Settings</h3>
              
              <div className="space-y-2">
                <Label htmlFor="proXpMultiplier" className="text-foreground">
                  Pro XP Multiplier
                </Label>
                <Input
                  id="proXpMultiplier"
                  name="proXpMultiplier"
                  type="number"
                  min="1"
                  max="10"
                  step="0.1"
                  defaultValue={config.proXpMultiplier}
                  className="bg-background border-border text-foreground"
                />
                <p className="text-xs text-muted-foreground">
                  XP multiplier for Pro users (1.0-10.0x)
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                className="bg-yellow-400 hover:bg-yellow-300 text-black font-semibold"
              >
                Save Configuration
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Current Configuration Display */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-lg text-foreground">Current Configuration</CardTitle>
          <CardDescription className="text-muted-foreground">
            Summary of current system settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Watch-to-Earn:</span>
                <span className={config.watchToEarnEnabled ? 'text-green-400' : 'text-red-400'}>
                  {config.watchToEarnEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cooldown:</span>
                <span className="text-foreground">{config.watchCooldownMin} min</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Daily Limit:</span>
                <span className="text-foreground">{config.watchDailyLimit}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pro Features:</span>
                <span className={config.proFeaturesEnabled ? 'text-green-400' : 'text-red-400'}>
                  {config.proFeaturesEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pro XP Multiplier:</span>
                <span className="text-foreground">{config.proXpMultiplier}x</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Social Features:</span>
                <span className={config.socialFeaturesEnabled ? 'text-green-400' : 'text-red-400'}>
                  {config.socialFeaturesEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
