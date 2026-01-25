import { getSession } from '@/lib/auth-server';
import { redirect } from 'next/navigation';
import DevBoardClient from './DevBoardClient';

export default async function DevBoardPage() {
  const user = await getSession();

  if (!user) {
    redirect('/login');
  }

  // Only general_manager can access
  if (user.role !== 'general_manager') {
    redirect('/dashboard');
  }

  return <DevBoardClient />;
}
