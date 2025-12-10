'use client';

import { useState, useEffect } from 'react';
import { Clock, Search, Trash2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { authClient } from '@/lib/auth';

interface Exercise {
  id: string;
  name: string;
  description?: string;
  meta?: {
    targetMuscleGroup?: string;
  };
}

interface HistoryEntry {
  id: string;
  exerciseId: string;
  viewedAt: string;
  notes?: string;
  exercise: Exercise;
}

interface HistoryResponse {
  data: HistoryEntry[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const limit = 15;

  const token = authClient.getToken();

  useEffect(() => {
    const user = authClient.getUser();
    if (!user || !token) {
      setError('Please log in to view your history');
      setIsLoading(false);
      return;
    }

    fetchHistory(currentPage);
  }, [currentPage, token]);

  const fetchHistory = async (page: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/users/history/exercises?page=${page}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch history');
      }

      const data: HistoryResponse = await response.json();
      setHistory(data.data || []);
      setTotalPages(data.pages || 1);
    } catch (err) {
      console.error('Error fetching history:', err);
      setError('Failed to load your exercise history');
      setHistory([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to clear all history? This cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch('/api/users/history/exercises', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to clear history');
      }

      setHistory([]);
      setCurrentPage(1);
      setError(null);
    } catch (err) {
      console.error('Error clearing history:', err);
      setError('Failed to clear history');
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    try {
      const response = await fetch(`/api/users/history/entries/${entryId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete entry');
      }

      setHistory(history.filter((h) => h.id !== entryId));
    } catch (err) {
      console.error('Error deleting entry:', err);
      setError('Failed to delete entry');
    }
  };

  const filteredHistory = history.filter(
    (item) =>
      item.exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.exercise.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!token) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <Clock className="mx-auto mb-4 text-gray-400" size={48} />
          <h1 className="text-2xl font-bold mb-2">Sign in to view your history</h1>
          <p className="text-gray-600 mb-6">Track your recently viewed exercises</p>
          <Link
            href="/login"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-2">
            <Clock className="text-blue-600" size={32} />
            Exercise History
          </h1>
          <p className="text-gray-600">
            {history.length === 0
              ? 'Your viewed exercises will appear here'
              : `${history.length} exercise${history.length !== 1 ? 's' : ''} viewed`}
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={handleClearAll}
            className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors font-medium"
          >
            <Trash2 size={18} />
            Clear All
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search your history..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="animate-spin text-blue-600" size={40} />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredHistory.length === 0 && !error && (
        <div className="text-center py-12">
          <Clock className="mx-auto mb-4 text-gray-400" size={48} />
          <h2 className="text-2xl font-bold mb-2">No history yet</h2>
          <p className="text-gray-600 mb-6">
            {searchQuery
              ? 'No exercises match your search'
              : 'Start exploring exercises to see them here!'}
          </p>
          <Link
            href="/dashboard/exercises"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Browse Exercises
          </Link>
        </div>
      )}

      {/* History Timeline */}
      {!isLoading && filteredHistory.length > 0 && (
        <>
          <div className="space-y-4 mb-8">
            {filteredHistory.map((entry) => (
              <div
                key={entry.id}
                className="flex items-start gap-4 p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all"
              >
                {/* Timeline Dot */}
                <div className="flex flex-col items-center pt-1">
                  <div className="w-3 h-3 rounded-full bg-blue-600" />
                  <div className="w-0.5 h-12 bg-gray-200 mt-2" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/dashboard/exercises/${entry.exerciseId}`}
                    className="text-lg font-semibold text-blue-600 hover:text-blue-700 hover:underline block truncate"
                  >
                    {entry.exercise.name}
                  </Link>

                  {entry.exercise.meta?.targetMuscleGroup && (
                    <p className="text-sm text-gray-600 mt-1">
                      💪 {entry.exercise.meta.targetMuscleGroup}
                    </p>
                  )}

                  {entry.exercise.description && (
                    <p className="text-sm text-gray-600 line-clamp-2 mt-2">
                      {entry.exercise.description}
                    </p>
                  )}

                  {entry.notes && (
                    <p className="text-sm text-blue-600 italic mt-2">
                      📝 {entry.notes}
                    </p>
                  )}

                  <p className="text-xs text-gray-500 mt-2">
                    Viewed: {new Date(entry.viewedAt).toLocaleString()}
                  </p>
                </div>

                {/* Actions */}
                <button
                  onClick={() => handleDeleteEntry(entry.id)}
                  className="px-2 py-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  title="Delete from history"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-8">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              <div className="flex items-center gap-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-2 rounded ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
