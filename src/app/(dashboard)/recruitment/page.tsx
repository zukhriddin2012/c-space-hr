import { redirect } from 'next/navigation';

// Redirect to the default recruitment view (board)
export default function RecruitmentPage() {
  redirect('/recruitment/board');
}
