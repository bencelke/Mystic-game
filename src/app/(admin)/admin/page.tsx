import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { getAuditStats } from '@/lib/audit/log';

// Server component to get admin stats
async function getAdminStats() {
  try {
    const stats = await getAuditStats();
    return stats;
  } catch (error) {
    console.error('Error getting admin stats:', error);
    return {
      totalLogs: 0,
      logsToday: 0,
      topActions: [],
      topUsers: []
    };
  }
}

export default async function AdminDashboard() {
  const stats = await getAdminStats();

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Manage Mystic Arcade settings and monitor system activity
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground">
              Total Audit Logs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-400">
              {stats.totalLogs.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground">
              Logs Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-400">
              {stats.logsToday.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground">
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">
              Online
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Features Config */}
        <Card className="border-border bg-card hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-xl text-foreground flex items-center gap-2">
              <span className="text-yellow-400">⚙️</span>
              Features Config
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Manage system features and settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Configure watch-to-earn settings, daily limits, and Pro features
            </p>
            <Button asChild className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-semibold">
              <Link href="/admin/features">
                Manage Features
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Users Management */}
        <Card className="border-border bg-card hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-xl text-foreground flex items-center gap-2">
              <span className="text-yellow-400">👥</span>
              Users
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              View and manage user accounts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Browse user profiles, Pro status, and activity
            </p>
            <Button asChild className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-semibold">
              <Link href="/admin/users">
                View Users
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Audit Logs */}
        <Card className="border-border bg-card hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-xl text-foreground flex items-center gap-2">
              <span className="text-yellow-400">📋</span>
              Audit Logs
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Monitor system activity and changes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Review admin actions and system events
            </p>
            <Button asChild className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-semibold">
              <Link href="/admin/audit">
                View Logs
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Actions */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-lg text-foreground">Top Actions</CardTitle>
            <CardDescription className="text-muted-foreground">
              Most frequent actions in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats.topActions.length > 0 ? (
              <div className="space-y-2">
                {stats.topActions.slice(0, 5).map((action, index) => (
                  <div key={action.action} className="flex justify-between items-center">
                    <span className="text-sm text-foreground">{action.action}</span>
                    <span className="text-sm text-yellow-400 font-medium">{action.count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No activity data available</p>
            )}
          </CardContent>
        </Card>

        {/* Top Users */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-lg text-foreground">Active Users</CardTitle>
            <CardDescription className="text-muted-foreground">
              Users with most activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats.topUsers.length > 0 ? (
              <div className="space-y-2">
                {stats.topUsers.slice(0, 5).map((user, index) => (
                  <div key={user.actorUid} className="flex justify-between items-center">
                    <span className="text-sm text-foreground font-mono">{user.actorUid}</span>
                    <span className="text-sm text-yellow-400 font-medium">{user.count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No user data available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-lg text-foreground">Quick Actions</CardTitle>
          <CardDescription className="text-muted-foreground">
            Common administrative tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button asChild variant="outline" className="border-border text-foreground hover:bg-muted">
              <Link href="/admin/features">
                Update Features
              </Link>
            </Button>
            <Button asChild variant="outline" className="border-border text-foreground hover:bg-muted">
              <Link href="/admin/users">
                Browse Users
              </Link>
            </Button>
            <Button asChild variant="outline" className="border-border text-foreground hover:bg-muted">
              <Link href="/admin/audit">
                View Logs
              </Link>
            </Button>
            <Button asChild variant="outline" className="border-border text-foreground hover:bg-muted">
              <Link href="/">
                Back to App
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
