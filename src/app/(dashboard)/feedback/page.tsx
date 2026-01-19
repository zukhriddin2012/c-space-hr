'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  MessageSquare,
  Send,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Star,
  Eye,
  EyeOff,
} from 'lucide-react';
import Link from 'next/link';

interface FeedbackSubmission {
  id: string;
  is_anonymous: boolean;
  category: string;
  feedback_text: string;
  rating: number | null;
  status: string;
  created_at: string;
  response_note: string | null;
}

const FEEDBACK_CATEGORIES = [
  { value: 'work_environment', label: 'Work Environment', description: 'Office, facilities, tools' },
  { value: 'management', label: 'Management & Leadership', description: 'Leadership, communication' },
  { value: 'career', label: 'Career Development', description: 'Growth, training, promotion' },
  { value: 'compensation', label: 'Compensation & Benefits', description: 'Salary, bonuses, benefits' },
  { value: 'suggestion', label: 'Suggestion / Idea', description: 'Improvement ideas' },
  { value: 'other', label: 'Other', description: 'General feedback' },
];

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'submitted':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Clock size={12} /> Submitted
        </span>
      );
    case 'read':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <Eye size={12} /> Read
        </span>
      );
    case 'acknowledged':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle2 size={12} /> Acknowledged
        </span>
      );
    default:
      return null;
  }
}

function getCategoryLabel(value: string): string {
  return FEEDBACK_CATEGORIES.find(c => c.value === value)?.label || value;
}

function StarRating({ rating, onChange, readOnly = false }: {
  rating: number;
  onChange?: (value: number) => void;
  readOnly?: boolean;
}) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => onChange?.(star === rating ? 0 : star)}
          className={`${readOnly ? '' : 'hover:scale-110 cursor-pointer'} transition-transform`}
        >
          <Star
            size={24}
            className={star <= rating
              ? 'fill-yellow-400 text-yellow-400'
              : 'text-gray-300'
            }
          />
        </button>
      ))}
    </div>
  );
}

export default function FeedbackPage() {
  const { user } = useAuth();
  const [myFeedback, setMyFeedback] = useState<FeedbackSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Form state
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [category, setCategory] = useState('');
  const [rating, setRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');

  useEffect(() => {
    fetchMyFeedback();
  }, []);

  const fetchMyFeedback = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/feedback/my');
      if (res.ok) {
        const data = await res.json();
        setMyFeedback(data.feedback || []);
      }
    } catch (error) {
      console.error('Error fetching feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setSubmitting(true);

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          is_anonymous: isAnonymous,
          category,
          rating: rating || null,
          feedback_text: feedbackText,
        }),
      });

      if (res.ok) {
        setSuccess(true);
        setIsAnonymous(false);
        setCategory('');
        setRating(0);
        setFeedbackText('');
        fetchMyFeedback();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to submit feedback');
      }
    } catch (error) {
      setError('Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
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
          <MessageSquare className="text-indigo-600" size={28} />
          Submit Feedback
        </h1>
        <p className="text-gray-600 mt-1">
          Share your thoughts with management. Your feedback helps us improve.
        </p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <CheckCircle2 className="text-green-600" size={20} />
          <div>
            <p className="font-medium text-green-800">Feedback submitted successfully!</p>
            <p className="text-sm text-green-600">Thank you for sharing your thoughts.</p>
          </div>
        </div>
      )}

      {/* Feedback Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Anonymous Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              {isAnonymous ? (
                <EyeOff className="text-gray-600" size={20} />
              ) : (
                <Eye className="text-gray-600" size={20} />
              )}
              <div>
                <p className="font-medium text-gray-900">Submit Anonymously</p>
                <p className="text-sm text-gray-500">
                  {isAnonymous
                    ? "Your name won't be visible to management"
                    : 'Your name will be visible to management'}
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Select a category...</option>
              {FEEDBACK_CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label} - {cat.description}
                </option>
              ))}
            </select>
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating (Optional)
            </label>
            <StarRating rating={rating} onChange={setRating} />
            <p className="text-xs text-gray-500 mt-1">
              {rating === 0 ? 'Click to rate' : `${rating} out of 5 stars`}
            </p>
          </div>

          {/* Feedback Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Feedback <span className="text-red-500">*</span>
            </label>
            <textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              required
              rows={5}
              placeholder="Share your thoughts, suggestions, or concerns..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              {feedbackText.length} characters
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting || !category || !feedbackText}
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Submit Feedback
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* My Previous Feedback */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">My Previous Feedback</h2>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : myFeedback.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="mx-auto mb-2 text-gray-300" size={40} />
            <p>You haven't submitted any feedback yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {myFeedback.map((feedback) => (
              <div
                key={feedback.id}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                      {getCategoryLabel(feedback.category)}
                    </span>
                    {feedback.is_anonymous && (
                      <span className="px-2 py-1 bg-gray-50 text-gray-500 text-xs rounded flex items-center gap-1">
                        <EyeOff size={12} /> Anonymous
                      </span>
                    )}
                    {getStatusBadge(feedback.status)}
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatDate(feedback.created_at)}
                  </span>
                </div>
                {feedback.rating && (
                  <div className="mb-2">
                    <StarRating rating={feedback.rating} readOnly />
                  </div>
                )}
                <p className="text-gray-700 text-sm line-clamp-3">
                  {feedback.feedback_text}
                </p>
                {feedback.response_note && (
                  <div className="mt-3 p-3 bg-indigo-50 rounded-lg">
                    <p className="text-xs text-indigo-600 font-medium mb-1">Response from Management:</p>
                    <p className="text-sm text-indigo-800">{feedback.response_note}</p>
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
