'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import {
  Inbox,
  MessageSquare,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  ArrowLeft,
  Star,
  Filter,
  User,
  Calendar,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import Link from 'next/link';

interface FeedbackSubmission {
  id: string;
  employee_id: string;
  is_anonymous: boolean;
  category: string;
  feedback_text: string;
  rating: number | null;
  status: string;
  read_by: string | null;
  read_at: string | null;
  acknowledged_by: string | null;
  acknowledged_at: string | null;
  response_note: string | null;
  created_at: string;
  employee?: {
    full_name: string;
    employee_id: string;
    position: string;
  };
  reader?: { full_name: string };
  acknowledger?: { full_name: string };
}

const FEEDBACK_CATEGORIES = [
  { value: 'work_environment', label: 'Work Environment' },
  { value: 'management', label: 'Management & Leadership' },
  { value: 'career', label: 'Career Development' },
  { value: 'compensation', label: 'Compensation & Benefits' },
  { value: 'suggestion', label: 'Suggestion / Idea' },
  { value: 'other', label: 'Other' },
];

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatShortDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

function getCategoryLabel(value: string): string {
  return FEEDBACK_CATEGORIES.find(c => c.value === value)?.label || value;
}

function getCategoryColor(value: string): string {
  const colors: Record<string, string> = {
    work_environment: 'bg-blue-100 text-blue-800',
    management: 'bg-purple-100 text-purple-800',
    career: 'bg-green-100 text-green-800',
    compensation: 'bg-yellow-100 text-yellow-800',
    suggestion: 'bg-indigo-100 text-indigo-800',
    other: 'bg-gray-100 text-gray-800',
  };
  return colors[value] || 'bg-gray-100 text-gray-800';
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={14}
          className={star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
        />
      ))}
    </div>
  );
}

export default function FeedbackReviewPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [feedback, setFeedback] = useState<FeedbackSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [responseNote, setResponseNote] = useState('');
  const [processing, setProcessing] = useState<string | null>(null);

  // Check permission
  useEffect(() => {
    if (user && !['general_manager', 'ceo'].includes(user.role)) {
      router.push('/dashboard');
    }
  }, [user, router]);

  useEffect(() => {
    fetchFeedback();
  }, [statusFilter]);

  const fetchFeedback = async () => {
    setLoading(true);
    try {
      const url = statusFilter === 'all'
        ? '/api/feedback'
        : `/api/feedback?status=${statusFilter}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setFeedback(data.feedback || []);
      }
    } catch (error) {
      console.error('Error fetching feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id: string) => {
    setProcessing(id);
    try {
      const res = await fetch(`/api/feedback/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'read' }),
      });
      if (res.ok) {
        fetchFeedback();
      }
    } catch (error) {
      console.error('Error marking feedback as read:', error);
    } finally {
      setProcessing(null);
    }
  };

  const handleAcknowledge = async (id: string) => {
    setProcessing(id);
    try {
      const res = await fetch(`/api/feedback/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'acknowledge',
          response_note: responseNote || null,
        }),
      });
      if (res.ok) {
        setResponseNote('');
        setExpandedId(null);
        fetchFeedback();
      }
    } catch (error) {
      console.error('Error acknowledging feedback:', error);
    } finally {
      setProcessing(null);
    }
  };

  const submittedCount = feedback.filter(f => f.status === 'submitted').length;
  const readCount = feedback.filter(f => f.status === 'read').length;
  const acknowledgedCount = feedback.filter(f => f.status === 'acknowledged').length;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <Inbox className="text-indigo-600" size={28} />
          Feedback Inbox
        </h1>
        <p className="text-gray-600 mt-1">
          Review and respond to employee feedback
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div
          className={`p-4 rounded-xl cursor-pointer transition-all ${
            statusFilter === 'submitted'
              ? 'bg-yellow-100 border-2 border-yellow-400'
              : 'bg-yellow-50 border border-yellow-200 hover:border-yellow-300'
          }`}
          onClick={() => setStatusFilter(statusFilter === 'submitted' ? 'all' : 'submitted')}
        >
          <div className="flex items-center gap-3">
            <Clock className="text-yellow-600" size={24} />
            <div>
              <p className="text-2xl font-bold text-yellow-800">{submittedCount}</p>
              <p className="text-sm text-yellow-700">Unread</p>
            </div>
          </div>
        </div>
        <div
          className={`p-4 rounded-xl cursor-pointer transition-all ${
            statusFilter === 'read'
              ? 'bg-blue-100 border-2 border-blue-400'
              : 'bg-blue-50 border border-blue-200 hover:border-blue-300'
          }`}
          onClick={() => setStatusFilter(statusFilter === 'read' ? 'all' : 'read')}
        >
          <div className="flex items-center gap-3">
            <Eye className="text-blue-600" size={24} />
            <div>
              <p className="text-2xl font-bold text-blue-800">{readCount}</p>
              <p className="text-sm text-blue-700">Read</p>
            </div>
          </div>
        </div>
        <div
          className={`p-4 rounded-xl cursor-pointer transition-all ${
            statusFilter === 'acknowledged'
              ? 'bg-green-100 border-2 border-green-400'
              : 'bg-green-50 border border-green-200 hover:border-green-300'
          }`}
          onClick={() => setStatusFilter(statusFilter === 'acknowledged' ? 'all' : 'acknowledged')}
        >
          <div className="flex items-center gap-3">
            <CheckCircle2 className="text-green-600" size={24} />
            <div>
              <p className="text-2xl font-bold text-green-800">{acknowledgedCount}</p>
              <p className="text-sm text-green-700">Acknowledged</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter indicator */}
      {statusFilter !== 'all' && (
        <div className="mb-4 flex items-center gap-2">
          <Filter size={16} className="text-gray-400" />
          <span className="text-sm text-gray-600">
            Showing: <span className="font-medium capitalize">{statusFilter}</span>
          </span>
          <button
            onClick={() => setStatusFilter('all')}
            className="text-sm text-indigo-600 hover:text-indigo-700"
          >
            Clear filter
          </button>
        </div>
      )}

      {/* Feedback List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : feedback.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <MessageSquare className="mx-auto mb-3 text-gray-300" size={48} />
            <p className="text-lg">No feedback found</p>
            <p className="text-sm">
              {statusFilter !== 'all' ? 'Try changing the filter' : 'Feedback will appear here when employees submit'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {feedback.map((item) => (
              <div
                key={item.id}
                className={`p-5 ${item.status === 'submitted' ? 'bg-yellow-50/50' : ''}`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getCategoryColor(item.category)}`}>
                      {getCategoryLabel(item.category)}
                    </span>
                    {item.is_anonymous ? (
                      <span className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        <EyeOff size={12} /> Anonymous
                      </span>
                    ) : item.employee && (
                      <span className="flex items-center gap-1 text-sm text-gray-700">
                        <User size={14} />
                        {item.employee.full_name} ({item.employee.employee_id})
                      </span>
                    )}
                    {item.rating && <StarRating rating={item.rating} />}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <Calendar size={12} />
                      {formatShortDate(item.created_at)}
                    </span>
                    {item.status === 'submitted' && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                        New
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <p className="text-gray-700 mb-4 whitespace-pre-wrap">
                  {item.feedback_text}
                </p>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {item.status === 'submitted' && (
                      <button
                        onClick={() => handleMarkRead(item.id)}
                        disabled={processing === item.id}
                        className="px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
                      >
                        {processing === item.id ? 'Processing...' : 'Mark as Read'}
                      </button>
                    )}
                    {(item.status === 'submitted' || item.status === 'read') && (
                      <button
                        onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                        className="px-3 py-1.5 text-sm bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors flex items-center gap-1"
                      >
                        Acknowledge
                        {expandedId === item.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                    )}
                    {item.status === 'acknowledged' && (
                      <span className="flex items-center gap-1 text-sm text-green-600">
                        <CheckCircle2 size={16} />
                        Acknowledged
                        {item.acknowledger && ` by ${item.acknowledger.full_name}`}
                      </span>
                    )}
                  </div>

                  {item.status === 'read' && item.reader && (
                    <span className="text-xs text-gray-500">
                      Read by {item.reader.full_name}
                    </span>
                  )}
                </div>

                {/* Acknowledge Form */}
                {expandedId === item.id && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Response Note (Optional)
                    </label>
                    <textarea
                      value={responseNote}
                      onChange={(e) => setResponseNote(e.target.value)}
                      rows={2}
                      placeholder="Add a note for internal reference..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none text-sm"
                    />
                    <div className="flex justify-end gap-2 mt-3">
                      <button
                        onClick={() => {
                          setExpandedId(null);
                          setResponseNote('');
                        }}
                        className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleAcknowledge(item.id)}
                        disabled={processing === item.id}
                        className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                      >
                        {processing === item.id ? 'Processing...' : 'Confirm Acknowledge'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Response Note Display */}
                {item.response_note && item.status === 'acknowledged' && (
                  <div className="mt-3 p-3 bg-indigo-50 rounded-lg">
                    <p className="text-xs text-indigo-600 font-medium mb-1">Internal Note:</p>
                    <p className="text-sm text-indigo-800">{item.response_note}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
