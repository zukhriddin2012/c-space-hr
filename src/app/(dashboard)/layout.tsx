import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth-server';
import Sidebar from '@/components/Sidebar';
import { AuthProvider } from '@/contexts/AuthContext';
import NotificationBell from '@/components/NotificationBell';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSession();

  if (!user) {
    redirect('/login');
  }

  const showNotifications = ['general_manager', 'ceo', 'hr'].includes(user.role);

  return (
    <AuthProvider initialUser={user}>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar user={user} />
        <main className="flex-1 overflow-auto">
          {/* Top Header Bar */}
          <div className="sticky top-0 z-40 bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-end gap-4">
            {showNotifications && <NotificationBell />}
            <div className="h-8 w-px bg-gray-200" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-700 text-sm font-medium">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-sm font-medium text-gray-700">{user.name}</span>
            </div>
          </div>
          <div className="p-6">{children}</div>
        </main>
      </div>
    </AuthProvider>
  );
}
