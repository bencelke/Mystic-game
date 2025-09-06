'use server';

import { getAuditLogs, searchAuditLogs, getAuditStats } from '@/lib/audit/log';
import { checkAndConsume } from '@/lib/security/rate-limit';
import { paginationSchema, searchSchema } from '@/lib/validation/inputs';

export interface AuditLogEntry {
  id: string;
  actorUid: string;
  action: string;
  targetPath: string;
  meta?: Record<string, any>;
  createdAt: Date;
  ipAddress?: string;
  userAgent?: string;
}

export interface GetAuditLogsResult {
  success: boolean;
  logs: AuditLogEntry[];
  total: number;
  error?: string;
}

export interface AuditStatsResult {
  success: boolean;
  stats?: {
    totalLogs: number;
    logsToday: number;
    topActions: Array<{ action: string; count: number }>;
    topUsers: Array<{ actorUid: string; count: number }>;
  };
  error?: string;
}

/**
 * Get audit logs with pagination and search
 */
export async function getAuditLogsAction({
  searchTerm,
  limit = 25,
  offset = 0
}: {
  searchTerm?: string;
  limit?: number;
  offset?: number;
}): Promise<GetAuditLogsResult> {
  try {
    // Mock user for now - in production this would come from auth
    const uid = 'mock-admin-user';
    
    // Rate limiting
    const rateLimitResult = await checkAndConsume(uid, 'admin:audit');
    if (!rateLimitResult.allowed) {
      return {
        success: false,
        logs: [],
        total: 0,
        error: 'Too many requests. Please wait a moment.'
      };
    }
    
    // Validate input
    const validatedPagination = paginationSchema.parse({ limit, offset });
    const validatedSearch = searchSchema.parse({ query: searchTerm });
    
    let result;
    
    if (validatedSearch.query) {
      result = await searchAuditLogs(
        validatedSearch.query,
        validatedPagination.limit,
        validatedPagination.offset
      );
    } else {
      result = await getAuditLogs(
        validatedPagination.limit,
        validatedPagination.offset
      );
    }
    
    return {
      success: true,
      logs: result.logs,
      total: result.total
    };
    
  } catch (error) {
    console.error('Error getting audit logs:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return {
        success: false,
        logs: [],
        total: 0,
        error: 'Invalid search parameters'
      };
    }
    
    return {
      success: false,
      logs: [],
      total: 0,
      error: 'Failed to load audit logs'
    };
  }
}

/**
 * Get audit statistics
 */
export async function getAuditStatsAction(): Promise<AuditStatsResult> {
  try {
    // Mock user for now - in production this would come from auth
    const uid = 'mock-admin-user';
    
    // Rate limiting
    const rateLimitResult = await checkAndConsume(uid, 'admin:audit');
    if (!rateLimitResult.allowed) {
      return {
        success: false,
        error: 'Too many requests. Please wait a moment.'
      };
    }
    
    const stats = await getAuditStats();
    
    return {
      success: true,
      stats
    };
    
  } catch (error) {
    console.error('Error getting audit stats:', error);
    return {
      success: false,
      error: 'Failed to load audit statistics'
    };
  }
}

/**
 * Get audit logs for a specific user
 */
export async function getAuditLogsForUserAction(
  userId: string,
  limit: number = 25,
  offset: number = 0
): Promise<GetAuditLogsResult> {
  try {
    // Mock user for now - in production this would come from auth
    const uid = 'mock-admin-user';
    
    // Rate limiting
    const rateLimitResult = await checkAndConsume(uid, 'admin:audit');
    if (!rateLimitResult.allowed) {
      return {
        success: false,
        logs: [],
        total: 0,
        error: 'Too many requests. Please wait a moment.'
      };
    }
    
    // Validate input
    const validatedPagination = paginationSchema.parse({ limit, offset });
    
    const result = await getAuditLogs(
      validatedPagination.limit,
      validatedPagination.offset
    );
    
    // Filter by user ID
    const userLogs = result.logs.filter(log => log.actorUid === userId);
    
    return {
      success: true,
      logs: userLogs,
      total: userLogs.length
    };
    
  } catch (error) {
    console.error('Error getting user audit logs:', error);
    return {
      success: false,
      logs: [],
      total: 0,
      error: 'Failed to load user audit logs'
    };
  }
}

/**
 * Get audit logs for a specific action
 */
export async function getAuditLogsForActionAction(
  action: string,
  limit: number = 25,
  offset: number = 0
): Promise<GetAuditLogsResult> {
  try {
    // Mock user for now - in production this would come from auth
    const uid = 'mock-admin-user';
    
    // Rate limiting
    const rateLimitResult = await checkAndConsume(uid, 'admin:audit');
    if (!rateLimitResult.allowed) {
      return {
        success: false,
        logs: [],
        total: 0,
        error: 'Too many requests. Please wait a moment.'
      };
    }
    
    // Validate input
    const validatedPagination = paginationSchema.parse({ limit, offset });
    
    const result = await getAuditLogs(
      validatedPagination.limit,
      validatedPagination.offset
    );
    
    // Filter by action
    const actionLogs = result.logs.filter(log => log.action === action);
    
    return {
      success: true,
      logs: actionLogs,
      total: actionLogs.length
    };
    
  } catch (error) {
    console.error('Error getting action audit logs:', error);
    return {
      success: false,
      logs: [],
      total: 0,
      error: 'Failed to load action audit logs'
    };
  }
}
