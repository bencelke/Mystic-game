'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
// TODO: Install Firebase dependencies: npm install firebase zod
// import { User, onAuthStateChanged } from 'firebase/auth';
// import { auth } from '@/lib/firebase/client';

// Temporary placeholder types and implementations
type User = any;
const onAuthStateChanged = (auth: any, callback: (user: User | null) => void) => {
  // Mock implementation - no auth state changes
  callback(null);
  return () => {};
};
const auth = {} as any;

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    user,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
