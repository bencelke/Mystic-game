import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { auditLogSchema } from '@/lib/validation/inputs';

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

export interface AuditLogInput {
  actorUid: string;
  action: string;
  targetPath: string;
  meta?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Log an audit event
 */
export async function logAudit(input: AuditLogInput): Promise<string> {
  try {
    // Validate input
    const validatedInput = auditLogSchema.parse(input);
    
    // Create audit log entry
    const auditEntry = {
      actorUid: validatedInput.actorUid,
      action: validatedInput.action,
      targetPath: validatedInput.targetPath,
      meta: validatedInput.meta || {},
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
      createdAt: FieldValue.serverTimestamp()
    };
    
    // Save to Firestore
    const docRef = await adminDb.collection('audit_logs').add(auditEntry);
    
    return docRef.id;
    
  } catch (error) {
    console.error('Audit logging error:', error);
    // Don't throw - audit logging should not break the main flow
    return '';
  }
}

/**
 * Get audit logs with pagination
 */
export async function getAuditLogs(
  limit: number = 25,
  offset: number = 0,
  orderBy: string = 'createdAt',
  orderDirection: 'asc' | 'desc' = 'desc'
): Promise<{ logs: AuditLogEntry[]; total: number }> {
  try {
    const query = adminDb
      .collection('audit_logs')
      .orderBy(orderBy, orderDirection)
      .offset(offset)
      .limit(limit);
    
    const snapshot = await query.get();
    const totalSnapshot = await adminDb.collection('audit_logs').count().get();
    
    const logs: AuditLogEntry[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || new Date()
    })) as AuditLogEntry[];
    
    return {
      logs,
      total: totalSnapshot.data().count
    };
    
  } catch (error) {
    console.error('Get audit logs error:', error);
    return { logs: [], total: 0 };
  }
}

/**
 * Get audit logs for a specific user
 */
export async function getAuditLogsForUser(
  uid: string,
  limit: number = 25,
  offset: number = 0
): Promise<{ logs: AuditLogEntry[]; total: number }> {
  try {
    const query = adminDb
      .collection('audit_logs')
      .where('actorUid', '==', uid)
      .orderBy('createdAt', 'desc')
      .offset(offset)
      .limit(limit);
    
    const snapshot = await query.get();
    const totalSnapshot = await adminDb
      .collection('audit_logs')
      .where('actorUid', '==', uid)
      .count()
      .get();
    
    const logs: AuditLogEntry[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || new Date()
    })) as AuditLogEntry[];
    
    return {
      logs,
      total: totalSnapshot.data().count
    };
    
  } catch (error) {
    console.error('Get user audit logs error:', error);
    return { logs: [], total: 0 };
  }
}

/**
 * Get audit logs for a specific action
 */
export async function getAuditLogsForAction(
  action: string,
  limit: number = 25,
  offset: number = 0
): Promise<{ logs: AuditLogEntry[]; total: number }> {
  try {
    const query = adminDb
      .collection('audit_logs')
      .where('action', '==', action)
      .orderBy('createdAt', 'desc')
      .offset(offset)
      .limit(limit);
    
    const snapshot = await query.get();
    const totalSnapshot = await adminDb
      .collection('audit_logs')
      .where('action', '==', action)
      .count()
      .get();
    
    const logs: AuditLogEntry[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || new Date()
    })) as AuditLogEntry[];
    
    return {
      logs,
      total: totalSnapshot.data().count
    };
    
  } catch (error) {
    console.error('Get action audit logs error:', error);
    return { logs: [], total: 0 };
  }
}

/**
 * Search audit logs
 */
export async function searchAuditLogs(
  searchTerm: string,
  limit: number = 25,
  offset: number = 0
): Promise<{ logs: AuditLogEntry[]; total: number }> {
  try {
    // Simple search - in production you might want to use Algolia or similar
    const query = adminDb
      .collection('audit_logs')
      .orderBy('createdAt', 'desc')
      .offset(offset)
      .limit(limit * 2); // Get more to filter
    
    const snapshot = await query.get();
    
    const allLogs: AuditLogEntry[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || new Date()
    })) as AuditLogEntry[];
    
    // Filter by search term
    const filteredLogs = allLogs.filter(log => 
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.targetPath.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.actorUid.toLowerCase().includes(searchTerm.toLowerCase()) ||
      JSON.stringify(log.meta || {}).toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, limit);
    
    return {
      logs: filteredLogs,
      total: filteredLogs.length
    };
    
  } catch (error) {
    console.error('Search audit logs error:', error);
    return { logs: [], total: 0 };
  }
}

/**
 * Clean up old audit logs (admin function)
 */
export async function cleanupOldAuditLogs(daysToKeep: number = 90): Promise<number> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    const query = adminDb
      .collection('audit_logs')
      .where('createdAt', '<', cutoffDate)
      .limit(1000); // Process in batches
    
    const snapshot = await query.get();
    
    if (snapshot.empty) {
      return 0;
    }
    
    const batch = adminDb.batch();
    let count = 0;
    
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
      count++;
    });
    
    await batch.commit();
    return count;
    
  } catch (error) {
    console.error('Audit logs cleanup error:', error);
    return 0;
  }
}

/**
 * Get audit log statistics
 */
export async function getAuditStats(): Promise<{
  totalLogs: number;
  logsToday: number;
  topActions: Array<{ action: string; count: number }>;
  topUsers: Array<{ actorUid: string; count: number }>;
}> {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get total logs
    const totalSnapshot = await adminDb.collection('audit_logs').count().get();
    
    // Get logs today
    const todaySnapshot = await adminDb
      .collection('audit_logs')
      .where('createdAt', '>=', today)
      .count()
      .get();
    
    // Get recent logs for analysis
    const recentSnapshot = await adminDb
      .collection('audit_logs')
      .orderBy('createdAt', 'desc')
      .limit(1000)
      .get();
    
    const recentLogs = recentSnapshot.docs.map(doc => doc.data());
    
    // Count actions
    const actionCounts: Record<string, number> = {};
    const userCounts: Record<string, number> = {};
    
    recentLogs.forEach(log => {
      actionCounts[log.action] = (actionCounts[log.action] || 0) + 1;
      userCounts[log.actorUid] = (userCounts[log.actorUid] || 0) + 1;
    });
    
    const topActions = Object.entries(actionCounts)
      .map(([action, count]) => ({ action, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    
    const topUsers = Object.entries(userCounts)
      .map(([actorUid, count]) => ({ actorUid, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    
    return {
      totalLogs: totalSnapshot.data().count,
      logsToday: todaySnapshot.data().count,
      topActions,
      topUsers
    };
    
  } catch (error) {
    console.error('Get audit stats error:', error);
    return {
      totalLogs: 0,
      logsToday: 0,
      topActions: [],
      topUsers: []
    };
  }
}
