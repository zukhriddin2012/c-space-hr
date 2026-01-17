import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth-server';
import Sidebar from '@/components/Sidebar';
import { AuthProvider } from '@/contexts/AuthContext';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSession();

  if (!user) {
    redirect('/login');
  }

  return (
    <AuthProvider initialUser={user}>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar user={user} />
        <main className="flex-1 overflow-auto">
          <div className="p-6">{children}</div>
        </main>
      </div>
    </AuthProvider>
  );
}
