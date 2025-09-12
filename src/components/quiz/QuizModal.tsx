'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { QuizInline } from './QuizInline';
import { QuizResult } from '@/types/quiz';

interface QuizModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kind: 'rune' | 'number';
  id: string | number;
  max?: number;
}

export function QuizModal({ 
  open, 
  onOpenChange, 
  kind, 
  id, 
  max = 5 
}: QuizModalProps) {
  const handleFinish = (result: QuizResult) => {
    // Close modal after a short delay to show the result
    setTimeout(() => {
      onOpenChange(false);
    }, 2000);
  };

  const getTitle = () => {
    if (kind === 'rune') {
      return `Quick Quiz — Rune ${id}`;
    } else {
      return `Quick Quiz — Number ${id}`;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-yellow-400">
            {getTitle()}
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <QuizInline
            kind={kind}
            id={id}
            onFinish={handleFinish}
            max={max}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
