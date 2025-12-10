'use client';

import { useState, useEffect, useMemo } from 'react';
import { Heart, Search, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { authClient } from '@/lib/auth';

interface Exercise {
  id: string;
  name: string;
  description?: string;
  muscleGroups?: string[];
  youtubeUrl?: string;
  gifUrl?: string;
  difficulty?: string;
}

interface FavoritesResponse {
  data: Exercise[];
  total: number;
  page: number;
  limit: number;
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const limit = 12;

  const token = authClient.getToken();

  useEffect(() => {
    const user = authClient.getUser();
    if (!user || !token) {
      setError('Please log in to view your favorites');
      setIsLoading(false);
      return;
    }

    fetchFavorites(currentPage);
  }, [currentPage, token]);

  const fetchFavorites = async (page: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/users/favorites/exercises?page=${page}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch favorites');
      }

      const data: FavoritesResponse = await response.json();
      setFavorites(data.data || []);
      setTotalPages(Math.ceil((data.total || 0) / limit));
    } catch (err) {
      console.error('Error fetching favorites:', err);
      setError('Failed to load your favorite exercises');
      setFavorites([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredFavorites = useMemo(() => {
    return favorites.filter((exercise) =>
      exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exercise.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [favorites, searchQuery]);

  const handleRemoveFavorite = async (exerciseId: string) => {
    try {
      const response = await fetch(`/api/exercises/${exerciseId}/favorite`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to remove favorite');
      }

      // Remove from list
      setFavorites(favorites.filter((ex) => ex.id !== exerciseId));
    } catch (err) {
      console.error('Error removing favorite:', err);
      setError('Failed to remove from favorites');
    }
  };

  if (!token) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <Heart className="mx-auto mb-4 text-gray-400" size={48} />
          <h1 className="text-2xl font-bold mb-2">Sign in to view your favorites</h1>
          <p className="text-gray-600 mb-6">
            Keep track of your favorite exercises and access them anytime
          </p>
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
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-2">
          <Heart className="text-red-500" size={32} fill="currentColor" />
          My Favorite Exercises
        </h1>
        <p className="text-gray-600">
          {favorites.length === 0
            ? 'Start adding exercises to your favorites!'
            : `You have ${favorites.length} favorite exercise${favorites.length !== 1 ? 's' : ''}`}
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search your favorites..."
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
      {!isLoading && filteredFavorites.length === 0 && !error && (
        <div className="text-center py-12">
          <Heart className="mx-auto mb-4 text-gray-400" size={48} />
          <h2 className="text-2xl font-bold mb-2">No favorites yet</h2>
          <p className="text-gray-600 mb-6">
            {searchQuery
              ? 'No favorites match your search'
              : 'Explore exercises and add them to your favorites!'}
          </p>
          <Link
            href="/dashboard/exercises"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Browse Exercises
          </Link>
        </div>
      )}

      {/* Favorites Grid */}
      {!isLoading && filteredFavorites.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredFavorites.map((exercise) => (
              <div
                key={exercise.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Thumbnail */}
                <div className="relative w-full h-48 bg-gray-200">
                  {exercise.youtubeUrl && (
                    <iframe
                      width="100%"
                      height="100%"
                      src={exercise.youtubeUrl.replace('watch?v=', 'embed/')}
                      title={exercise.name}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="absolute inset-0"
                    />
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="text-lg font-bold mb-2 line-clamp-2">
                    {exercise.name}
                  </h3>

                  {/* Muscle Groups */}
                  {exercise.muscleGroups && exercise.muscleGroups.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {exercise.muscleGroups.map((group) => (
                        <span
                          key={group}
                          className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                        >
                          {group}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Difficulty */}
                  {exercise.difficulty && (
                    <div className="mb-3">
                      <span
                        className={`px-2 py-1 text-xs font-bold rounded ${
                          exercise.difficulty === 'Beginner'
                            ? 'bg-green-100 text-green-700'
                            : exercise.difficulty === 'Intermediate'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {exercise.difficulty}
                      </span>
                    </div>
                  )}

                  {/* Description */}
                  {exercise.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {exercise.description}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link
                      href={`/dashboard/exercises/${exercise.id}`}
                      className="flex-1 bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 text-center text-sm font-medium"
                    >
                      View Details
                    </Link>
                    <button
                      onClick={() => handleRemoveFavorite(exercise.id)}
                      className="px-3 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200 text-sm font-medium"
                      title="Remove from favorites"
                    >
                      <Heart size={18} fill="currentColor" />
                    </button>
                  </div>
                </div>
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
