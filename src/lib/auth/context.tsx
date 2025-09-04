'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import type { UserDoc } from '@/types/mystic';

interface AuthContextType {
  user: (User & UserDoc) | null;
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
  const [user, setUser] = useState<(User & UserDoc) | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: User | null) => {
      if (firebaseUser) {
        // Create a mock user with UserDoc structure for development
        const mockUserDoc: UserDoc = {
          xp: 150,
          level: 3,
          streak: 7,
          proEntitlement: false,
          achievements: ['first_login', 'streak_3'],
        };
        
        // Combine Firebase User with UserDoc
        const combinedUser = Object.assign(firebaseUser, mockUserDoc);
        setUser(combinedUser);
      } else {
        setUser(null);
      }
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
