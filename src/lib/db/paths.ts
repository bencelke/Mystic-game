// Firestore Database Path Helpers

// User documents
export const userDoc = (uid: string) => `users/${uid}`;
export const orbsDoc = (uid: string) => `orbs/${uid}`;
export const codexDoc = (uid: string) => `codex/${uid}`;
export const gameStateDoc = (uid: string) => `gameState/${uid}`;

// Global documents
export const featuresConfigDoc = () => 'config/features';
export const globalStatsDoc = (dateKey: string) => `stats/global/${dateKey}`;

// Collections
export const usersCollection = () => 'users';
export const orbsCollection = () => 'orbs';
export const codexCollection = () => 'codex';
export const gameStateCollection = () => 'gameState';
export const configCollection = () => 'config';
export const statsCollection = () => 'stats';

// Ritual and game data
export const ritualLogDoc = (uid: string, ritualId: string) => `users/${uid}/rituals/${ritualId}`;
export const achievementsDoc = (uid: string) => `users/${uid}/achievements`;
export const dailyChallengesDoc = (dateKey: string) => `challenges/daily/${dateKey}`;

// Social features
export const socialInteractionsDoc = (interactionId: string) => `social/${interactionId}`;
export const friendRequestsDoc = (uid: string) => `users/${uid}/friends/requests`;
export const friendsListDoc = (uid: string) => `users/${uid}/friends/list`;
