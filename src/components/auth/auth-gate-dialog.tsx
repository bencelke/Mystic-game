'use client';

import { AuthDialog } from './auth-dialog';

interface AuthGateDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAuthenticated: () => void;
}

export function AuthGateDialog({ isOpen, onOpenChange, onAuthenticated }: AuthGateDialogProps) {
  return (
    <AuthDialog
      open={isOpen}
      onOpenChange={onOpenChange}
      onAuthenticated={onAuthenticated}
    />
  );
}
