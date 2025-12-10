'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Clock } from 'lucide-react';
import { authClient } from '@/lib/auth';

interface Exercise {
  id: string;
  name: string;
  description?: string;
  meta?: {
    targetMuscleGroup?: string;
  };
}

interface RecentView {
  id: string;
  exerciseId: string;
  viewedAt: string;
  exercise: Exercise;
}

export default function RecentlyViewedComponent({ limit = 6 }) {
  const [recent, setRecent] = useState<RecentView[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const token = authClient.getToken();

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    const fetchRecent = async () => {
      try {
        const response = await fetch(
          `/api/users/history/recent?limit=${limit}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setRecent(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error('Error fetching recently viewed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecent();
  }, [token, limit]);

  if (!token || isLoading) return null;

  if (recent.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Clock size={20} className="text-blue-600" />
        <h2 className="text-xl font-bold">Recently Viewed</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {recent.map((item) => (
          <Link
            key={item.id}
            href={`/dashboard/exercises/${item.exerciseId}`}
            className="group relative overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            <div className="aspect-square bg-gradient-to-br from-blue-100 to-blue-50 p-3 flex flex-col justify-between h-full">
              <div>
                <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {item.exercise.name}
                </h3>
                {item.exercise.meta?.targetMuscleGroup && (
                  <p className="text-xs text-gray-600 mt-1">
                    {item.exercise.meta.targetMuscleGroup}
                  </p>
                )}
              </div>

              <p className="text-xs text-gray-500">
                {new Date(item.viewedAt).toLocaleDateString()}
              </p>
            </div>
          </Link>
        ))}
      </div>

      <div className="text-center mt-4">
        <Link
          href="/dashboard/exercises/history"
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          View Full History →
        </Link>
      </div>
    </div>
  );
}
