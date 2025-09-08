'use client';

import { Dialog, DialogContent } from '@/components/ui/dialog';
import { SignInCard } from './sign-in-card';
import { useEffect } from 'react';

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAuthenticated?: () => void;
}

export function AuthDialog({ open, onOpenChange, onAuthenticated }: AuthDialogProps) {
  const handleSuccess = () => {
    onAuthenticated?.();
    onOpenChange(false);
  };

  // Prevent background scroll when dialog is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm w-full mx-4 bg-card text-foreground border-border min-h-[60vh] max-h-[85vh] overflow-y-auto p-4">
        <div className="pb-safe-area-inset-bottom">
          <SignInCard onSuccess={handleSuccess} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
