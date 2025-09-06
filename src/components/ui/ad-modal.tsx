'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface AdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdComplete: () => void;
  ritualType: 'daily' | 'spread2' | 'spread3' | 'compatibility';
}

export function AdModal({ isOpen, onClose, onAdComplete, ritualType }: AdModalProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isOpen && !isPlaying) {
      // Start the ad simulation
      setIsPlaying(true);
      setProgress(0);
      
      // Simulate ad progress over 3 seconds
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsPlaying(false);
            return 100;
          }
          return prev + 2;
        });
      }, 60);

      return () => clearInterval(interval);
    }
  }, [isOpen, isPlaying]);

  const handleAdComplete = () => {
    onAdComplete();
    onClose();
  };

  const getRitualName = () => {
    switch (ritualType) {
      case 'daily': return 'Daily Rune';
      case 'spread2': return 'Two-Rune Spread';
      case 'spread3': return 'Three-Rune Spread';
      default: return 'Ritual';
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          <Card className="border-2 border-yellow-500/30 bg-card shadow-glow">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-bold text-foreground">
                🔮 Watch a Vision
              </CardTitle>
              <p className="text-muted-foreground text-sm">
                Watch a mystical vision to unlock {getRitualName()}
              </p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {isPlaying ? (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="text-2xl"
                    >
                      🔮
                    </motion.div>
                  </div>
                  
                  <div>
                    <p className="text-foreground font-medium mb-2">Vision playing...</p>
                    <div className="w-full bg-muted rounded-full h-2">
                      <motion.div
                        className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.1 }}
                      />
                    </div>
                    <p className="text-muted-foreground text-xs mt-1">
                      {progress}% complete
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-green-900/30 flex items-center justify-center">
                    <span className="text-2xl">✅</span>
                  </div>
                  
                  <div>
                    <p className="text-foreground font-medium mb-2">Vision Complete!</p>
                    <p className="text-muted-foreground text-sm">
                      You can now perform {getRitualName()}
                    </p>
                  </div>
                  
                  <Button
                    onClick={handleAdComplete}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    Continue to Ritual
                  </Button>
                </div>
              )}
              
              <div className="text-center">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
