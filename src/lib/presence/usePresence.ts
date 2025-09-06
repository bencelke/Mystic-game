'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth/context';
import { getDatabase, ref, onValue, onDisconnect, set, serverTimestamp } from 'firebase/database';
import { firebaseApp } from '@/lib/firebase/client';

export interface PresenceState {
  onlineCount: number;
  ready: boolean;
}

export function usePresence(): PresenceState {
  const { user } = useAuth();
  const [onlineCount, setOnlineCount] = useState(0);
  const [ready, setReady] = useState(false);
  const connectedRef = useRef<boolean>(false);
  const presenceRef = useRef<any>(null);

  useEffect(() => {
    if (!user) {
      setOnlineCount(0);
      setReady(false);
      return;
    }

    const db = getDatabase(firebaseApp);
    const connectedRef_db = ref(db, '.info/connected');
    const presenceRef_db = ref(db, 'rooms/lobby/members');

    // Listen to connection status
    const connectedListener = onValue(connectedRef_db, (snapshot) => {
      const isConnected = snapshot.val();
      
      if (isConnected && !connectedRef.current) {
        // User is connected, set presence
        const userPresenceRef = ref(db, `rooms/lobby/members/${user.uid}`);
        
        // Set presence with server timestamp
        set(userPresenceRef, {
          online: true,
          lastSeen: serverTimestamp(),
          uid: user.uid
        });

        // Set up disconnect cleanup
        onDisconnect(userPresenceRef).remove();
        
        connectedRef.current = true;
        setReady(true);
      } else if (!isConnected && connectedRef.current) {
        // User disconnected
        connectedRef.current = false;
        setReady(false);
      }
    });

    // Listen to presence count
    const presenceListener = onValue(presenceRef_db, (snapshot) => {
      const members = snapshot.val();
      if (members) {
        const count = Object.keys(members).length;
        setOnlineCount(count);
      } else {
        setOnlineCount(0);
      }
    });

    // Cleanup
    return () => {
      connectedListener();
      presenceListener();
      if (connectedRef.current && user) {
        // Remove presence on cleanup
        const userPresenceRef = ref(db, `rooms/lobby/members/${user.uid}`);
        set(userPresenceRef, null);
      }
    };
  }, [user]);

  return { onlineCount, ready };
}
