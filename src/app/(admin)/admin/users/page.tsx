import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { getUsersAction } from './actions';
import { Search, User, Crown, Calendar, TrendingUp } from 'lucide-react';

// Server component to get users
async function getUsers(searchTerm?: string, limit: number = 25, offset: number = 0) {
  try {
    const result = await getUsersAction({ searchTerm, limit, offset });
    return result;
  } catch (error) {
    console.error('Error getting users:', error);
    return { success: false, users: [], total: 0, error: 'Failed to load users' };
  }
}

export default async function UsersPage({
  searchParams,
}: {
  searchParams: { search?: string; page?: string };
}) {
  const searchTerm = searchParams.search || '';
  const page = parseInt(searchParams.page || '1');
  const limit = 25;
  const offset = (page - 1) * limit;

  const { success, users, total, error } = await getUsers(searchTerm, limit, offset);

  if (!success) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Users</h1>
          <p className="text-muted-foreground mt-2">
            Manage user accounts and view activity
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

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Users</h1>
        <p className="text-muted-foreground mt-2">
          Manage user accounts and view activity
        </p>
      </div>

      {/* Search and Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
              <User className="h-4 w-4" />
              Total Users
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
              <Crown className="h-4 w-4" />
              Pro Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-400">
              {users.filter(user => user.proEntitlement).length}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Active Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-400">
              {users.filter(user => {
                if (!user.lastLoginAt) return false;
                const lastLogin = new Date(user.lastLoginAt);
                const today = new Date();
                return lastLogin.toDateString() === today.toDateString();
              }).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-lg text-foreground">Search Users</CardTitle>
          <CardDescription className="text-muted-foreground">
            Find users by email or UID
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form method="GET" className="flex gap-4">
            <div className="flex-1">
              <Input
                name="search"
                placeholder="Search by email or UID..."
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

      {/* Users List */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-lg text-foreground">User List</CardTitle>
          <CardDescription className="text-muted-foreground">
            Showing {users.length} of {total} users
          </CardDescription>
        </CardHeader>
        <CardContent>
          {users.length > 0 ? (
            <div className="space-y-4">
              {users.map((user) => (
                <div
                  key={user.uid}
                  className="flex items-center justify-between p-4 rounded-lg border border-border bg-background hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold">
                      {user.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">
                          {user.email || 'No email'}
                        </span>
                        {user.proEntitlement && (
                          <Badge className="bg-yellow-400 text-black text-xs">
                            PRO
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground font-mono">
                        {user.uid}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <div className="text-center">
                      <div className="font-medium text-foreground">Level</div>
                      <div>{user.level || 1}</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-foreground">Streak</div>
                      <div>{user.streak || 0}</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-foreground">XP</div>
                      <div>{user.xp || 0}</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-foreground">Last Login</div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {user.lastLoginAt ? (
                          new Date(user.lastLoginAt).toLocaleDateString()
                        ) : (
                          'Never'
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No users found</p>
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
