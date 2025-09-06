'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: string;
}

export function UpgradeModal({ isOpen, onClose, feature }: UpgradeModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", duration: 0.5 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md"
        >
          <Card className="border-yellow-500/50 bg-gradient-to-br from-purple-900/90 to-black/90 shadow-2xl shadow-yellow-500/20">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-6xl mb-4">✨</div>
              <CardTitle className="text-2xl text-yellow-400 font-cinzel">
                Unlock Mystic Pro
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Unlock deeper insights with Mystic Pro
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center space-y-4">
                <p className="text-foreground">
                  Access <span className="text-yellow-400 font-semibold">{feature}</span> and unlock the full power of your mystical journey.
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="text-yellow-400">✨</span>
                    <span>Deep numerology readings</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="text-yellow-400">✨</span>
                    <span>Advanced ritual interpretations</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="text-yellow-400">✨</span>
                    <span>Unlimited daily rituals</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="text-yellow-400">✨</span>
                    <span>Exclusive Pro features</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 text-black font-semibold"
                  onClick={() => {
                    // TODO: Implement actual upgrade flow
                    console.log('Upgrade to Pro clicked');
                    onClose();
                  }}
                >
                  Upgrade to Mystic Pro
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
                  onClick={onClose}
                >
                  Maybe Later
                </Button>
              </div>

              <div className="text-center">
                <p className="text-xs text-muted-foreground">
                  Join thousands of mystics on their journey
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
