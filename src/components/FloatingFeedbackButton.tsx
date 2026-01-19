'use client';

import Link from 'next/link';
import { MessageSquare } from 'lucide-react';

interface FloatingFeedbackButtonProps {
  userRole: string;
}

export default function FloatingFeedbackButton({ userRole }: FloatingFeedbackButtonProps) {
  // Only show for roles that can submit feedback (not GM or CEO who review feedback)
  const canSubmitFeedback = ['employee', 'branch_manager', 'recruiter', 'hr'].includes(userRole);

  if (!canSubmitFeedback) {
    return null;
  }

  return (
    <Link
      href="/feedback"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 hover:shadow-xl transition-all group"
      title="Give Feedback"
    >
      <MessageSquare size={20} />
      <span className="hidden sm:inline font-medium">Feedback</span>
    </Link>
  );
}
