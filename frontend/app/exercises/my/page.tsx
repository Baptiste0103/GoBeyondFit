'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Search, Trash2, Film, Edit, Plus as PlusIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth';

interface Exercise {
  id: string;
  name: string;
  description?: string;
  meta?: {
    muscleGroups?: string[];
    difficulty?: string;
    videoUrl?: string;
    instructions?: string[];
  };
  createdAt?: string;
}

interface Session {
  id: string;
  title: string;
  weekNumber?: number;
  blockTitle?: string;
}

interface ExerciseConfig {
  sets?: number;
  reps?: number;
  format?: string;
  weight?: number;
  duration?: number;
  notes?: string;
}

export default function MyExercisesPage() {
  const router = useRouter();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  
  // Add to session modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [exerciseConfig, setExerciseConfig] = useState<ExerciseConfig>({
    sets: 3,
    reps: 10,
    format: 'standard',
  });
  const [isAddingExercise, setIsAddingExercise] = useState(false);
  
  const token = authClient.getToken();
  const itemsPerPage = 12;

  const loadExercises = useCallback(async (page: number = 1, search: string = '') => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', itemsPerPage.toString());
      if (search.trim()) {
        params.append('search', search.trim());
      }

      const response = await fetch(`/api/exercises/my/created?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to load exercises: ${response.status}`);
      }

      const data = await response.json();
      setExercises(data.data || []);
      setTotalPages(Math.ceil((data.total || 0) / itemsPerPage));
      setCurrentPage(page);
    } catch (err) {
      console.error('Error loading exercises:', err);
      setError(err instanceof Error ? err.message : 'Failed to load exercises');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  // Load sessions for the modal
  const loadSessions = useCallback(async () => {
    try {
      const response = await fetch(`/api/sessions/my`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSessions(data.data || []);
      }
    } catch (err) {
      console.error('Error loading sessions:', err);
    }
  }, [token]);

  // Open add to session modal
  const openAddModal = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setExerciseConfig({
      sets: 3,
      reps: 10,
      format: 'standard',
    });
    setSelectedSessionId(null);
    setShowAddModal(true);
    loadSessions();
  };

  // Add exercise to session
  const addExerciseToSession = async () => {
    if (!selectedExercise || !selectedSessionId) return;

    try {
      setIsAddingExercise(true);
      const response = await fetch(`/api/sessions/${selectedSessionId}/exercises`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          exerciseId: selectedExercise.id,
          config: exerciseConfig,
        }),
      });

      if (response.ok) {
        setShowAddModal(false);
        setSelectedExercise(null);
        setSelectedSessionId(null);
        // Show success message
        alert(`${selectedExercise.name} added to session!`);
      } else {
        setError('Failed to add exercise to session');
      }
    } catch (err) {
      console.error('Error adding exercise:', err);
      setError('Error adding exercise to session');
    } finally {
      setIsAddingExercise(false);
    }
  };

  // Load exercises on mount and when search changes
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      loadExercises(1, searchQuery);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, loadExercises]);

  const handleDelete = async (exerciseId: string) => {
    if (!confirm('Are you sure you want to delete this exercise?')) {
      return;
    }

    try {
      const response = await fetch(`/api/exercises/${exerciseId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setExercises(exercises.filter((e) => e.id !== exerciseId));
      } else {
        setError('Failed to delete exercise');
      }
    } catch (err) {
      console.error('Error deleting exercise:', err);
      setError('Error deleting exercise');
    }
  };

  const muscleGroups = exercises[0]?.meta?.muscleGroups || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">My Exercises</h1>
            <p className="text-gray-600">Manage your created exercises and add video demos</p>
          </div>
          <Link
            href="/exercises/create"
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            <Plus size={20} />
            New Exercise
          </Link>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search exercises by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition outline-none"
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
            {error}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && exercises.length === 0 && !error && (
          <div className="text-center py-12">
            <Film size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No exercises yet</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery ? 'No exercises match your search.' : 'Create your first exercise to get started.'}
            </p>
            {!searchQuery && (
              <Link
                href="/exercises/create"
                className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <Plus size={18} />
                Create Exercise
              </Link>
            )}
          </div>
        )}

        {/* Exercises Grid */}
        {!isLoading && exercises.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {exercises.map((exercise) => (
                <div
                  key={exercise.id}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden"
                >
                  {/* Video Demo Banner */}
                  {exercise.meta?.videoUrl && (
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-2 flex items-center gap-2 text-white text-sm font-medium">
                      <Film size={16} />
                      Video Demo Available
                    </div>
                  )}

                  {/* Card Content */}
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{exercise.name}</h3>

                    {exercise.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {exercise.description}
                      </p>
                    )}

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {exercise.meta?.difficulty && (
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            exercise.meta.difficulty === 'Beginner'
                              ? 'bg-green-100 text-green-700'
                              : exercise.meta.difficulty === 'Intermediate'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {exercise.meta.difficulty}
                        </span>
                      )}
                      {exercise.meta?.muscleGroups &&
                        exercise.meta.muscleGroups.slice(0, 2).map((group) => (
                          <span key={group} className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700">
                            {group}
                          </span>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => router.push(`/exercises/${exercise.id}/edit`)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition text-sm font-medium"
                      >
                        <Edit size={16} />
                        Edit
                      </button>

                      <button
                        onClick={() => openAddModal(exercise)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-100 text-green-600 rounded hover:bg-green-200 transition text-sm font-medium"
                      >
                        <PlusIcon size={16} />
                        Add
                      </button>

                      <button
                        onClick={() => handleDelete(exercise.id)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200 transition text-sm font-medium"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>

                      {exercise.meta?.videoUrl && (
                        <a
                          href={exercise.meta.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-indigo-100 text-indigo-600 rounded hover:bg-indigo-200 transition text-sm font-medium"
                        >
                          <Film size={16} />
                          Video
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <button
                  onClick={() => loadExercises(currentPage - 1, searchQuery)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition"
                >
                  ← Previous
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => loadExercises(i + 1, searchQuery)}
                      className={`px-3 py-2 rounded-lg transition ${
                        currentPage === i + 1
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => loadExercises(currentPage + 1, searchQuery)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add to Session Modal */}
      {showAddModal && selectedExercise && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Add Exercise to Session</h2>
              <p className="text-gray-600 text-sm mt-1">{selectedExercise.name}</p>
            </div>

            {/* Session Selection */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Select Session *
              </label>
              {sessions.length === 0 ? (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
                  No sessions available. Create a session first.
                </div>
              ) : (
                <select
                  value={selectedSessionId || ''}
                  onChange={(e) => setSelectedSessionId(e.target.value)}
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900"
                >
                  <option value="">-- Choose a session --</option>
                  {sessions.map((session) => (
                    <option key={session.id} value={session.id}>
                      {session.blockTitle && `${session.blockTitle} > `}
                      {session.title}
                      {session.weekNumber && ` (Week ${session.weekNumber})`}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Sets */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Sets
              </label>
              <input
                type="number"
                min="1"
                value={exerciseConfig.sets || 3}
                onChange={(e) =>
                  setExerciseConfig({ ...exerciseConfig, sets: parseInt(e.target.value) || 1 })
                }
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900"
              />
            </div>

            {/* Reps */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Reps
              </label>
              <input
                type="number"
                min="1"
                value={exerciseConfig.reps || 10}
                onChange={(e) =>
                  setExerciseConfig({ ...exerciseConfig, reps: parseInt(e.target.value) || 1 })
                }
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900"
              />
            </div>

            {/* Format */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Format
              </label>
              <select
                value={exerciseConfig.format || 'standard'}
                onChange={(e) =>
                  setExerciseConfig({ ...exerciseConfig, format: e.target.value })
                }
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900"
              >
                <option value="standard">📊 Standard (Sets x Reps)</option>
                <option value="amrap">⏱️ AMRAP (As Many Reps As Possible)</option>
                <option value="emom">⏰ EMOM (Every Minute On Minute)</option>
                <option value="time">⏱️ Time-based</option>
                <option value="distance">📏 Distance-based</option>
              </select>
            </div>

            {/* Weight */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Weight (kg) - Optional
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={exerciseConfig.weight || ''}
                onChange={(e) =>
                  setExerciseConfig({
                    ...exerciseConfig,
                    weight: e.target.value ? parseFloat(e.target.value) : undefined,
                  })
                }
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900"
                placeholder="e.g., 20"
              />
            </div>

            {/* Duration */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Duration (seconds) - Optional
              </label>
              <input
                type="number"
                min="0"
                value={exerciseConfig.duration || ''}
                onChange={(e) =>
                  setExerciseConfig({
                    ...exerciseConfig,
                    duration: e.target.value ? parseInt(e.target.value) : undefined,
                  })
                }
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900"
                placeholder="e.g., 60"
              />
            </div>

            {/* Notes */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Notes - Optional
              </label>
              <textarea
                value={exerciseConfig.notes || ''}
                onChange={(e) =>
                  setExerciseConfig({ ...exerciseConfig, notes: e.target.value })
                }
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900"
                placeholder="Add any notes or instructions..."
                rows={3}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSelectedExercise(null);
                  setSelectedSessionId(null);
                }}
                disabled={isAddingExercise}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={addExerciseToSession}
                disabled={isAddingExercise || !selectedSessionId || sessions.length === 0}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isAddingExercise ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Adding...
                  </>
                ) : (
                  <>
                    <PlusIcon size={18} />
                    Add to Session
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
