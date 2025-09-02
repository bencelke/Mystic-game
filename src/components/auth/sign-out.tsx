'use client';

// TODO: Install Firebase dependencies: npm install firebase zod
// import { signOut } from 'firebase/auth';
// import { auth } from '@/lib/firebase/client';

// Temporary placeholder implementations
const signOut = async (auth: any) => {
  console.log('Mock: Sign out');
  throw new Error('Firebase not installed. Please run: npm install firebase zod');
};
const auth = {} as any;
import { useAuth } from '@/lib/auth/context';
import { Button } from '@/components/ui/button';

export const SignOut = () => {
  const { user } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (!user) return null;

  return (
    <div className="flex items-center gap-4">
      <div className="text-sm">
        <span className="text-gray-500">Welcome, </span>
        <span className="font-medium text-yellow-500">{user.email}</span>
      </div>
      <Button
        onClick={handleSignOut}
        variant="outline"
        size="sm"
        className="border-yellow-500/40 text-yellow-500 hover:bg-yellow-500/10"
      >
        Sign Out
      </Button>
    </div>
  );
};
