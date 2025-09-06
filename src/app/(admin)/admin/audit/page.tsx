import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { getAuditLogsAction } from './actions';
import { Search, Clock, User, Activity, Filter } from 'lucide-react';

// Server component to get audit logs
async function getAuditLogs(searchTerm?: string, limit: number = 25, offset: number = 0) {
  try {
    const result = await getAuditLogsAction({ searchTerm, limit, offset });
    return result;
  } catch (error) {
    console.error('Error getting audit logs:', error);
    return { success: false, logs: [], total: 0, error: 'Failed to load audit logs' };
  }
}

export default async function AuditLogsPage({
  searchParams,
}: {
  searchParams: { search?: string; page?: string };
}) {
  const searchTerm = searchParams.search || '';
  const page = parseInt(searchParams.page || '1');
  const limit = 25;
  const offset = (page - 1) * limit;

  const { success, logs, total, error } = await getAuditLogs(searchTerm, limit, offset);

  if (!success) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Audit Logs</h1>
          <p className="text-muted-foreground mt-2">
            Monitor system activity and administrative actions
          </p>
        </div>
        <Card className="border-border bg-card">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalPages = Math.ceil(total / limit);

  // Group logs by action type for stats
  const actionCounts = logs.reduce((acc, log) => {
    acc[log.action] = (acc[log.action] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Audit Logs</h1>
        <p className="text-muted-foreground mt-2">
          Monitor system activity and administrative actions
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Total Logs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-400">
              {total.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-400">
              {logs.length}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
              <User className="h-4 w-4" />
              Unique Actors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-400">
              {new Set(logs.map(log => log.actorUid)).size}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Action Types
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-400">
              {Object.keys(actionCounts).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-lg text-foreground">Search Logs</CardTitle>
          <CardDescription className="text-muted-foreground">
            Search by action, user, or target path
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form method="GET" className="flex gap-4">
            <div className="flex-1">
              <Input
                name="search"
                placeholder="Search logs..."
                defaultValue={searchTerm}
                className="bg-background border-border text-foreground"
              />
            </div>
            <Button type="submit" className="bg-yellow-400 hover:bg-yellow-300 text-black font-semibold">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Action Type Filters */}
      {Object.keys(actionCounts).length > 0 && (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-lg text-foreground">Action Types</CardTitle>
            <CardDescription className="text-muted-foreground">
              Filter by action type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Object.entries(actionCounts).map(([action, count]) => (
                <Badge
                  key={action}
                  variant="outline"
                  className="border-border text-foreground hover:bg-muted cursor-pointer"
                >
                  {action} ({count})
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Audit Logs List */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-lg text-foreground">Audit Logs</CardTitle>
          <CardDescription className="text-muted-foreground">
            Showing {logs.length} of {total} logs
          </CardDescription>
        </CardHeader>
        <CardContent>
          {logs.length > 0 ? (
            <div className="space-y-4">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="p-4 rounded-lg border border-border bg-background hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge
                          variant="outline"
                          className="border-border text-foreground"
                        >
                          {log.action}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {log.createdAt.toLocaleString()}
                        </span>
                      </div>
                      
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2">
                          <User className="h-3 w-3 text-muted-foreground" />
                          <span className="font-mono text-foreground">
                            {log.actorUid}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Activity className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            Target: {log.targetPath}
                          </span>
                        </div>
                        
                        {log.meta && Object.keys(log.meta).length > 0 && (
                          <div className="mt-2 p-2 rounded bg-muted/50">
                            <div className="text-xs text-muted-foreground mb-1">Metadata:</div>
                            <pre className="text-xs text-foreground overflow-x-auto">
                              {JSON.stringify(log.meta, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No audit logs found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </div>
              <div className="flex gap-2">
                {page > 1 && (
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="border-border text-foreground hover:bg-muted"
                  >
                    <a href={`?search=${searchTerm}&page=${page - 1}`}>
                      Previous
                    </a>
                  </Button>
                )}
                {page < totalPages && (
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="border-border text-foreground hover:bg-muted"
                  >
                    <a href={`?search=${searchTerm}&page=${page + 1}`}>
                      Next
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
