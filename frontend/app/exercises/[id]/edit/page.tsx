'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, ArrowLeft } from 'lucide-react';

const MUSCLE_GROUPS = [
  'Chest',
  'Back',
  'Shoulders',
  'Biceps',
  'Triceps',
  'Forearms',
  'Legs',
  'Quadriceps',
  'Hamstrings',
  'Glutes',
  'Calves',
  'Abs',
  'Core',
];

const DIFFICULTY_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

interface Exercise {
  id: string;
  name: string;
  description: string;
  difficulty: string;
  muscleGroups: string[];
  instructions: string[];
  videoUrl?: string;
  sets?: number;
  reps?: number;
}

export default function EditExercisePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [formData, setFormData] = useState<Exercise>({
    id: '',
    name: '',
    description: '',
    difficulty: 'Beginner',
    muscleGroups: [],
    instructions: [],
    videoUrl: '',
    sets: 3,
    reps: 10,
  });

  // Load exercise
  useEffect(() => {
    const loadExercise = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/exercises/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error('Failed to load exercise');

        const exercise = await response.json();
        setFormData({
          id: exercise.id,
          name: exercise.name,
          description: exercise.description,
          difficulty: exercise.meta?.difficulty || 'Beginner',
          muscleGroups: exercise.meta?.muscleGroups || [],
          instructions: exercise.meta?.instructions || [],
          videoUrl: exercise.meta?.videoUrl || '',
          sets: exercise.meta?.sets || 3,
          reps: exercise.meta?.reps || 10,
        });
      } catch (error) {
        console.error('Error loading exercise:', error);
        setErrors(['Failed to load exercise']);
      } finally {
        setLoading(false);
      }
    };

    loadExercise();
  }, [id]);

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: string[] = [];

    if (!formData.name.trim() || formData.name.length < 3) {
      newErrors.push('Exercise name must be at least 3 characters');
    }

    if (!formData.description.trim()) {
      newErrors.push('Description is required');
    }

    if (formData.muscleGroups.length === 0) {
      newErrors.push('Select at least one muscle group');
    }

    if (formData.instructions.length === 0) {
      newErrors.push('Add at least one instruction');
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSaving(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/exercises/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          difficulty: formData.difficulty,
          muscleGroups: formData.muscleGroups,
          instructions: formData.instructions,
          videoUrl: formData.videoUrl,
          sets: formData.sets,
          reps: formData.reps,
        }),
      });

      if (!response.ok) throw new Error('Failed to update exercise');

      router.push('/exercises/my');
    } catch (error) {
      console.error('Error saving exercise:', error);
      setErrors(['Failed to save exercise']);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading exercise...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/exercises/my')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium mb-4"
          >
            <ArrowLeft size={18} />
            Back to My Exercises
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Edit Exercise</h1>
          <p className="text-gray-600 mt-2">Update your exercise details</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8 space-y-6">
          {/* Error Messages */}
          {errors.length > 0 && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
              <div className="text-red-700">
                {errors.map((error, i) => (
                  <p key={i} className="text-sm">
                    • {error}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Exercise Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Exercise Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Push-ups, Squats, etc."
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe the exercise..."
              rows={3}
            />
          </div>

          {/* Difficulty & Muscle Groups */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty Level</label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {DIFFICULTY_LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Muscle Groups * ({formData.muscleGroups.length})
              </label>
              <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-3 space-y-2 bg-gray-50">
                {MUSCLE_GROUPS.map((group) => (
                  <label key={group} className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1 rounded">
                    <input
                      type="checkbox"
                      checked={formData.muscleGroups.includes(group)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            muscleGroups: [...formData.muscleGroups, group],
                          });
                        } else {
                          setFormData({
                            ...formData,
                            muscleGroups: formData.muscleGroups.filter((g) => g !== group),
                          });
                        }
                      }}
                      className="rounded"
                    />
                    <span className="text-sm">{group}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Sets & Reps */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sets</label>
              <input
                type="number"
                value={formData.sets}
                onChange={(e) => setFormData({ ...formData, sets: parseInt(e.target.value) || 1 })}
                min="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Reps</label>
              <input
                type="number"
                value={formData.reps}
                onChange={(e) => setFormData({ ...formData, reps: parseInt(e.target.value) || 1 })}
                min="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Instructions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Instructions * ({formData.instructions.length})</label>
            <div className="space-y-2 mb-3">
              {formData.instructions.map((instruction, i) => (
                <div key={i} className="flex gap-2 items-start bg-gray-50 p-3 rounded-lg">
                  <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={instruction}
                      onChange={(e) => {
                        const newInstructions = [...formData.instructions];
                        newInstructions[i] = e.target.value;
                        setFormData({ ...formData, instructions: newInstructions });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        instructions: formData.instructions.filter((_, idx) => idx !== i),
                      });
                    }}
                    className="text-red-500 hover:text-red-700 font-bold"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() =>
                setFormData({
                  ...formData,
                  instructions: [...formData.instructions, ''],
                })
              }
              className="w-full px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 font-medium transition"
            >
              + Add Instruction
            </button>
          </div>

          {/* Video URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Video URL (optional)</label>
            <input
              type="url"
              value={formData.videoUrl}
              onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://youtube.com/..."
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-6 border-t">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 transition"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/exercises/my')}
              className="flex-1 px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
