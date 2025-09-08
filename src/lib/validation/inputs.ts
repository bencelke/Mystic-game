import { z } from 'zod';

// Name validation - allows international characters, hyphens, apostrophes
export const nameSchema = z
  .string()
  .trim()
  .min(1, 'Name is required')
  .max(50, 'Name must be 50 characters or less')
  .regex(
    /^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/,
    'Name can only contain letters, spaces, hyphens, and apostrophes'
  );

// Date of birth validation
export const dobSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
  .refine((date) => {
    const parsed = new Date(date);
    return !isNaN(parsed.getTime());
  }, 'Invalid date')
  .refine((date) => {
    const parsed = new Date(date);
    const now = new Date();
    return parsed <= now;
  }, 'Date cannot be in the future')
  .refine((date) => {
    const parsed = new Date(date);
    const now = new Date();
    const age = now.getFullYear() - parsed.getFullYear();
    return age >= 0 && age <= 150;
  }, 'Please enter a valid date of birth');

// Email validation
export const emailSchema = z
  .string()
  .email('Invalid email format')
  .max(254, 'Email must be 254 characters or less');

// Numerology compatibility input validation
export const compatibilityInputSchema = z.object({
  partnerName: nameSchema,
  partnerDob: dobSchema,
});

// Ritual input validation
export const ritualInputSchema = z.object({
  idempotencyKey: z.string().optional(),
  seed: z.string().optional(),
});

// Vision input validation
export const visionInputSchema = z.object({
  placement: z.enum(['rune_daily', 'rune_spread2', 'rune_spread3', 'numerology_daily', 'numerology_compat', 'wheel']),
  reward: z.enum(['ORB', 'PASS']),
  idempotencyKey: z.string().optional(),
});

// Admin features config validation
export const featuresConfigSchema = z.object({
  watchToEarnEnabled: z.boolean(),
  watchCooldownMin: z.number().min(1).max(1440), // 1 minute to 24 hours
  watchDailyLimit: z.number().min(1).max(100), // 1 to 100 per day
  dailyRitualEnabled: z.boolean(),
  proFeaturesEnabled: z.boolean(),
  socialFeaturesEnabled: z.boolean(),
  offlineModeEnabled: z.boolean(),
  inlineWheelEnabled: z.boolean(),
  proXpMultiplier: z.number().min(1).max(10), // 1x to 10x multiplier
  // Wheel settings
  wheelDailyFree: z.number().min(0).max(10), // 0 to 10 free spins
  wheelDailyFreePro: z.number().min(0).max(20), // 0 to 20 pro free spins
  wheelAllowVisionExtra: z.boolean(),
  wheelDailyMax: z.number().min(1).max(50), // 1 to 50 max spins per day
  wheelVisionPlacement: z.string().min(1).max(50), // Vision placement key
});

// User profile update validation
export const userProfileUpdateSchema = z.object({
  dob: dobSchema.optional(),
  name: nameSchema.optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  'At least one field must be provided'
);

// Rate limiting key validation
export const rateLimitKeySchema = z.enum([
  'ritual:rune',
  'ritual:compat',
  'vision:rune_daily',
  'vision:rune_spread2',
  'vision:rune_spread3',
  'vision:numerology_daily',
  'vision:numerology_compat',
  'vision:wheel',
  'wheel:spin',
  'admin:features',
  'admin:users',
]);

// Idempotency key validation
export const idempotencyKeySchema = z
  .string()
  .min(1, 'Idempotency key is required')
  .max(100, 'Idempotency key must be 100 characters or less')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Idempotency key can only contain letters, numbers, hyphens, and underscores');

// Audit log validation
export const auditLogSchema = z.object({
  actorUid: z.string().min(1),
  action: z.string().min(1).max(100),
  targetPath: z.string().min(1).max(200),
  meta: z.record(z.string(), z.any()).optional(),
});

// Pagination validation
export const paginationSchema = z.object({
  limit: z.number().min(1).max(100).default(25),
  offset: z.number().min(0).default(0),
  orderBy: z.string().optional(),
  orderDirection: z.enum(['asc', 'desc']).default('desc'),
});

// Search validation
export const searchSchema = z.object({
  query: z.string().min(1).max(100).optional(),
  filters: z.record(z.string(), z.any()).optional(),
});

// Export types
export type NameInput = z.infer<typeof nameSchema>;
export type DobInput = z.infer<typeof dobSchema>;
export type EmailInput = z.infer<typeof emailSchema>;
export type CompatibilityInput = z.infer<typeof compatibilityInputSchema>;
export type RitualInput = z.infer<typeof ritualInputSchema>;
export type VisionInput = z.infer<typeof visionInputSchema>;
export type FeaturesConfigInput = z.infer<typeof featuresConfigSchema>;
export type UserProfileUpdateInput = z.infer<typeof userProfileUpdateSchema>;
export type RateLimitKeyInput = z.infer<typeof rateLimitKeySchema>;
export type IdempotencyKeyInput = z.infer<typeof idempotencyKeySchema>;
export type AuditLogInput = z.infer<typeof auditLogSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type SearchInput = z.infer<typeof searchSchema>;
