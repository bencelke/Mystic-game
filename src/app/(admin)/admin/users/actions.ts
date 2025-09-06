'use server';

import { adminDb } from '@/lib/firebase/admin';
import { checkAndConsume } from '@/lib/security/rate-limit';
import { paginationSchema, searchSchema } from '@/lib/validation/inputs';

export interface UserSummary {
  uid: string;
  email?: string;
  proEntitlement?: boolean;
  level: number;
  xp: number;
  streak: number;
  lastLoginAt?: any;
  createdAt?: any;
}

export interface GetUsersResult {
  success: boolean;
  users: UserSummary[];
  total: number;
  error?: string;
}

/**
 * Get users with pagination and search
 */
export async function getUsersAction({
  searchTerm,
  limit = 25,
  offset = 0
}: {
  searchTerm?: string;
  limit?: number;
  offset?: number;
}): Promise<GetUsersResult> {
  try {
    // Mock user for now - in production this would come from auth
    const uid = 'mock-admin-user';
    
    // Rate limiting
    const rateLimitResult = await checkAndConsume(uid, 'admin:users');
    if (!rateLimitResult.allowed) {
      return {
        success: false,
        users: [],
        total: 0,
        error: 'Too many requests. Please wait a moment.'
      };
    }
    
    // Validate input
    const validatedPagination = paginationSchema.parse({ limit, offset });
    const validatedSearch = searchSchema.parse({ query: searchTerm });
    
    let query = adminDb.collection('users').orderBy('createdAt', 'desc');
    
    // Apply search filter if provided
    if (validatedSearch.query) {
      // For now, we'll get all users and filter client-side
      // In production, you might want to use Algolia or similar for better search
      const allUsersSnapshot = await adminDb.collection('users').get();
      const allUsers = allUsersSnapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      })) as UserSummary[];
      
      const filteredUsers = allUsers.filter(user => 
        user.email?.toLowerCase().includes(validatedSearch.query!.toLowerCase()) ||
        user.uid.toLowerCase().includes(validatedSearch.query!.toLowerCase())
      );
      
      const paginatedUsers = filteredUsers.slice(
        validatedPagination.offset,
        validatedPagination.offset + validatedPagination.limit
      );
      
      return {
        success: true,
        users: paginatedUsers,
        total: filteredUsers.length
      };
    }
    
    // Get total count
    const totalSnapshot = await adminDb.collection('users').count().get();
    
    // Get paginated users
    const usersSnapshot = await query
      .offset(validatedPagination.offset)
      .limit(validatedPagination.limit)
      .get();
    
    const users: UserSummary[] = usersSnapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data()
    })) as UserSummary[];
    
    return {
      success: true,
      users,
      total: totalSnapshot.data().count
    };
    
  } catch (error) {
    console.error('Error getting users:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return {
        success: false,
        users: [],
        total: 0,
        error: 'Invalid search parameters'
      };
    }
    
    return {
      success: false,
      users: [],
      total: 0,
      error: 'Failed to load users'
    };
  }
}

/**
 * Get user details by UID
 */
export async function getUserDetailsAction(uid: string): Promise<{
  success: boolean;
  user?: UserSummary;
  error?: string;
}> {
  try {
    // Mock user for now - in production this would come from auth
    const adminUid = 'mock-admin-user';
    
    // Rate limiting
    const rateLimitResult = await checkAndConsume(adminUid, 'admin:users');
    if (!rateLimitResult.allowed) {
      return {
        success: false,
        error: 'Too many requests. Please wait a moment.'
      };
    }
    
    const userDoc = await adminDb.collection('users').doc(uid).get();
    
    if (!userDoc.exists) {
      return {
        success: false,
        error: 'User not found'
      };
    }
    
    const user = {
      uid: userDoc.id,
      ...userDoc.data()
    } as UserSummary;
    
    return {
      success: true,
      user
    };
    
  } catch (error) {
    console.error('Error getting user details:', error);
    return {
      success: false,
      error: 'Failed to load user details'
    };
  }
}
