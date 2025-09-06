import { redirect } from 'next/navigation';
import { auth } from '@/lib/firebase/client';
import { getAuth } from 'firebase-admin/auth';
import { adminDb } from '@/lib/firebase/admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// Server component to check admin status
async function checkAdminStatus(): Promise<{ isAdmin: boolean; userEmail?: string }> {
  try {
    // In a real implementation, you would get the user from the request
    // For now, we'll use a mock approach
    const uid = 'mock-admin-user'; // This would come from the authenticated user
    
    // Get user's custom claims
    const userRecord = await getAuth().getUser(uid);
    const isAdmin = userRecord.customClaims?.admin === true;
    
    return {
      isAdmin,
      userEmail: userRecord.email
    };
  } catch (error) {
    console.error('Error checking admin status:', error);
    return { isAdmin: false };
  }
}

// 403 Forbidden page component
function ForbiddenPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
      <Card className="w-full max-w-md border-border bg-card">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-foreground flex items-center justify-center gap-2">
            <span className="text-yellow-400">🔒</span>
            Access Denied
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            You don't have permission to access the admin console
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            This area is restricted to administrators only.
          </p>
          <div className="flex justify-center">
            <Button asChild className="bg-yellow-400 hover:bg-yellow-300 text-black font-semibold">
              <Link href="/">
                Return to Home
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAdmin, userEmail } = await checkAdminStatus();

  if (!isAdmin) {
    return <ForbiddenPage />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Admin Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="text-2xl font-bold text-foreground">
                <span className="text-yellow-400">⚡</span> Mystic Admin
              </Link>
              <div className="hidden md:flex items-center gap-6 text-sm">
                <Link href="/admin" className="text-muted-foreground hover:text-foreground transition-colors">
                  Dashboard
                </Link>
                <Link href="/admin/features" className="text-muted-foreground hover:text-foreground transition-colors">
                  Features
                </Link>
                <Link href="/admin/users" className="text-muted-foreground hover:text-foreground transition-colors">
                  Users
                </Link>
                <Link href="/admin/audit" className="text-muted-foreground hover:text-foreground transition-colors">
                  Audit Logs
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {userEmail}
              </span>
              <Button asChild variant="outline" size="sm">
                <Link href="/">
                  Exit Admin
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Admin Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
