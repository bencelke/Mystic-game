// Mystic Arcade Game Types

// Firebase Timestamp type (will be replaced with actual Firebase import)
export type Timestamp = any;

// Shared timestamp type to avoid conflicts between admin/client
export type TimestampLike = Timestamp;

// User Profile Document
export interface UserDoc {
  dob?: string; // Date of birth in ISO format
  xp: number; // Experience points
  level: number; // Current level
  streak: number; // Daily streak count
  proEntitlement?: boolean; // Pro subscription status
  achievements?: string[]; // Array of achievement IDs
  lastLoginAt?: TimestampLike; // Last login timestamp for streak calculation
  lastWatchAt?: TimestampLike; // Last rewarded ad watch timestamp
  createdAt?: TimestampLike; // Account creation timestamp
  // Stripe billing fields
  stripeCustomerId?: string; // Stripe customer ID
  stripeSubscriptionId?: string; // Stripe subscription ID
  proSince?: TimestampLike; // When Pro subscription started
  proPlan?: 'monthly' | 'yearly'; // Pro subscription plan
  proCurrentPeriodEnd?: TimestampLike; // When current period ends
}

// Orbs System Document
export interface OrbsDoc {
  current: number; // Current orb count
  max: number; // Maximum orb capacity
  regenRatePerHour: number; // Orbs regenerated per hour
  lastRegenAt: Timestamp; // Last regeneration timestamp
}

// Codex Collection Document
export interface CodexDoc {
  runes: string[]; // Array of rune IDs
  tarot: string[]; // Array of tarot card IDs
  numerology: number[]; // Array of numerology numbers (1-9, 11, 22)
  sigils?: string[]; // Array of sigil IDs (optional)
}

// Wheel Ledger Document
export interface WheelLedgerDoc {
  dateKey: string; // UTC date key (YYYY-MM-DD)
  spinsToday: number; // Number of spins used today
  lastSpinAt?: TimestampLike; // Last spin timestamp
}

// Inventory Document
export interface InventoryDoc {
  streakFreeze: number; // Count of Streak Freeze items
}

// Ritual Performance Log
export interface RitualLog {
  type: "rune" | "tarot" | "numerology" | "wheel"; // Type of ritual performed
  mode: "daily" | "single" | "spread" | "deep" | "compatibility" | "vision"; // Ritual mode
  cards?: Array<{
    id: string; // Card ID
    reversed?: boolean; // Whether card is reversed
    position?: "past" | "present" | "future"; // Position in spread
  }>; // Array of cards (for tarot rituals)
  runeId?: string; // Rune ID (for rune rituals)
  number?: number; // Numerology number (for numerology rituals)
  deepContent?: string; // Deep interpretation content (for deep numerology)
  inputs?: { // Compatibility ritual inputs
    you: { name: string; dob: string };
    partner: { name: string; dob: string };
  };
  results?: { // Compatibility ritual results
    lpA: number; // Your life path
    lpB: number; // Partner life path
    nnA: number; // Your name number
    nnB: number; // Partner name number
    score: number; // Compatibility score (0-100)
  };
  wheelResult?: { // Wheel ritual result
    kind: "ORB" | "XP" | "STREAK_FREEZE"; // Type of reward
    value: number; // Amount of reward
  };
  costOrbs: number; // Orbs spent on ritual
  xpAwarded: number; // Experience points gained
  seed?: string; // Random seed for ritual generation
  createdAt: Timestamp; // When ritual was performed
}

// Features Configuration
export interface FeaturesConfig {
  watchToEarnEnabled: boolean; // Whether watch-to-earn is active
  watchCooldownMin: number; // Cooldown in minutes between rewarded ads
  watchDailyLimit: number; // Maximum visions per day per user
  dailyRitualEnabled: boolean; // Whether daily rituals are available
  proFeaturesEnabled: boolean; // Whether pro features are unlocked
  socialFeaturesEnabled: boolean; // Whether social features are active
  offlineModeEnabled: boolean; // Whether offline play is allowed
  inlineWheelEnabled: boolean; // Whether inline wheel widget is enabled in rituals
  // Wheel settings
  wheelDailyFree: number; // Free spins per day for free users
  wheelDailyFreePro: number; // Free spins per day for pro users
  wheelAllowVisionExtra: boolean; // Whether extra spins via Vision are allowed
  wheelDailyMax: number; // Maximum spins per day (inclusive of free spins)
  wheelVisionPlacement: string; // Vision placement key for wheel
}

// Game State Document
export interface GameStateDoc {
  userId: string; // Reference to user
  lastDailyRitual?: Timestamp; // Last daily ritual timestamp
  currentStreak: number; // Current daily streak
  longestStreak: number; // Longest streak achieved
  totalRituals: number; // Total rituals performed
  totalXpEarned: number; // Total XP earned
  achievements: string[]; // Array of achievement IDs
  preferences: {
    theme: "light" | "dark" | "auto"; // UI theme preference
    notifications: boolean; // Notification preferences
    soundEnabled: boolean; // Sound effects preference
    musicEnabled: boolean; // Background music preference
  };
}

// Rune Definition (Legacy - for database documents)
export interface RuneDoc {
  id: string; // Unique rune identifier
  name: string; // Rune name
  meaning: string; // Rune meaning/interpretation
  element: "fire" | "water" | "earth" | "air" | "spirit"; // Elemental association
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary"; // Rarity level
  xpValue: number; // XP value when used
  orbCost: number; // Orb cost to cast
  unlockLevel: number; // Level required to unlock
  category: "protection" | "wisdom" | "strength" | "healing" | "transformation"; // Rune category
}

// Rune Content (for UI display and content management)
export interface RuneContent {
  id: string; // Unique rune identifier
  symbol: string; // Rune symbol/character
  name: string; // Rune name
  upright: string; // Upright meaning
  reversed?: string; // Reversed meaning (optional)
  info?: string; // Additional information/description
  keywords?: string[]; // Associated keywords
  element?: "fire" | "water" | "earth" | "air"; // Elemental association
  phoneme?: string; // Phonetic sound
  altNames?: string[]; // Alternative names
  // Lore fields
  history?: string; // Historical context and lore
  advice?: string; // Practical advice for using this rune
  shadow?: string; // Shadow aspects and warnings
  ritualIdeas?: string[]; // Ideas for rituals and practices
}

// Tarot Card Definition
export interface TarotCardDoc {
  id: string; // Unique card identifier
  name: string; // Card name
  meaning: string; // Card meaning/interpretation
  reversedMeaning: string; // Reversed card meaning
  suit: "major" | "wands" | "cups" | "swords" | "pentacles"; // Tarot suit
  number?: number; // Card number (null for major arcana)
  element: "fire" | "water" | "earth" | "air" | "spirit"; // Elemental association
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary"; // Rarity level
  xpValue: number; // XP value when drawn
  orbCost: number; // Orb cost to draw
  unlockLevel: number; // Level required to unlock
}

// Sigil Definition
export interface SigilDoc {
  id: string; // Unique sigil identifier
  name: string; // Sigil name
  meaning: string; // Sigil meaning/interpretation
  power: number; // Sigil power level (1-10)
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary"; // Rarity level
  unlockCondition: string; // How to unlock this sigil
  xpBonus: number; // XP bonus when sigil is active
  orbCost: number; // Orb cost to activate
}

// Achievement Definition
export interface AchievementDoc {
  id: string; // Unique achievement identifier
  name: string; // Achievement name
  description: string; // Achievement description
  category: "rituals" | "streaks" | "collection" | "social" | "special"; // Achievement category
  requirement: number; // Number required to complete
  xpReward: number; // XP reward for completion
  orbReward: number; // Orb reward for completion
  icon: string; // Achievement icon identifier
  unlockedAt?: Timestamp; // When achievement was unlocked
}

// Daily Challenge
export interface DailyChallengeDoc {
  id: string; // Unique challenge identifier
  date: string; // Date in YYYY-MM-DD format
  type: "rune" | "tarot" | "numerology" | "mixed"; // Challenge type
  description: string; // Challenge description
  requirement: string; // What needs to be accomplished
  xpReward: number; // XP reward for completion
  orbReward: number; // Orb reward for completion
  completedBy: string[]; // Array of user IDs who completed it
  expiresAt: Timestamp; // When challenge expires
}

// Social Interaction
export interface SocialInteractionDoc {
  id: string; // Unique interaction identifier
  type: "friend_request" | "gift" | "challenge" | "message"; // Interaction type
  fromUserId: string; // User who initiated interaction
  toUserId: string; // User who receives interaction
  content?: string; // Message content or gift description
  status: "pending" | "accepted" | "declined" | "expired"; // Interaction status
  createdAt: Timestamp; // When interaction was created
  respondedAt?: Timestamp; // When interaction was responded to
}

// Rune Favorites Document
export interface RuneFavoritesDoc {
  [runeId: string]: boolean; // Map of rune IDs to favorite status
}

// Rune Note Document
export interface RuneNoteDoc {
  runeId: string; // Rune ID this note belongs to
  text: string; // Note content
  updatedAt: TimestampLike; // Last updated timestamp
}

// Number Favorites Document
export interface NumberFavoritesDoc {
  [numId: string]: boolean; // Map of number IDs to favorite status
}

// Number Note Document
export interface NumberNoteDoc {
  numId: number; // Number ID this note belongs to
  text: string; // Note content
  updatedAt: TimestampLike; // Last updated timestamp
}

// Rune Favorites Document
export interface RuneFavoritesDoc {
  [runeId: string]: boolean; // Map of rune IDs to favorite status
}

// Rune Note Document
export interface RuneNoteDoc {
  runeId: string; // Rune ID this note belongs to
  text: string; // Note content
  updatedAt: TimestampLike; // Last update timestamp
}

// All types are already exported above
