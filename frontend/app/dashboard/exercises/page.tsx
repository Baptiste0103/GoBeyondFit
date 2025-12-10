'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/sidebar'
import { authClient } from '@/lib/auth'
import { exerciseClient, type Exercise, type CreateExerciseInput } from '@/lib/api-client'

export default function ExercisesPage() {
  const router = useRouter()
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [formData, setFormData] = useState<CreateExerciseInput>({
    name: '',
    description: '',
    type: 'standard',
    scope: 'coach',
  })

  useEffect(() => {
    // Check if user is authenticated and token is not expired
    if (!authClient.isAuthenticated()) {
      router.push('/auth/login')
      return
    }
    loadExercises()
  }, [router])

  const loadExercises = async () => {
    try {
      setLoading(true)
      const data = await exerciseClient.getAll()
      setExercises(data)
      setError('')
    } catch (err: any) {
      setError(err.message || 'Failed to load exercises')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      if (editingId) {
        await exerciseClient.update(editingId, formData)
      } else {
        await exerciseClient.create(formData)
      }

      setFormData({
        name: '',
        description: '',
        type: 'standard',
        scope: 'coach',
      })
      setEditingId(null)
      setShowForm(false)
      await loadExercises()
    } catch (err: any) {
      setError(err.message || 'Failed to save exercise')
    }
  }

  const handleEdit = (exercise: Exercise) => {
    setFormData({
      name: exercise.name,
      description: exercise.description || '',
      type: exercise.type,
      scope: exercise.scope,
    })
    setEditingId(exercise.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return

    try {
      await exerciseClient.delete(id)
      await loadExercises()
    } catch (err: any) {
      setError(err.message || 'Failed to delete exercise')
    }
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />

      <main className="flex-1 overflow-auto">
        <div className="p-8 md:ml-0">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900">💪 Exercises</h1>
              <button
                onClick={() => {
                  setShowForm(!showForm)
                  setEditingId(null)
                  setFormData({
                    name: '',
                    description: '',
                    type: 'standard',
                    scope: 'coach',
                  })
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                {showForm ? 'Cancel' : '➕ New Exercise'}
              </button>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            {/* Form */}
            {showForm && (
              <div className="mb-8 bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">
                  {editingId ? 'Edit Exercise' : 'Create New Exercise'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Type *</label>
                      <select
                        required
                        value={formData.type}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            type: e.target.value as any,
                          })
                        }
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="standard">Standard</option>
                        <option value="EMOM">EMOM</option>
                        <option value="AMRAP">AMRAP</option>
                        <option value="custom">Custom</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Scope *</label>
                      <select
                        required
                        value={formData.scope}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            scope: e.target.value as any,
                          })
                        }
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="coach">Coach</option>
                        <option value="global">Global (Admin only)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Description</label>
                      <input
                        type="text"
                        value={formData.description || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, description: e.target.value })
                        }
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                    >
                      {editingId ? 'Update' : 'Create'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false)
                        setEditingId(null)
                      }}
                      className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            )}

            {/* Exercises List */}
            {!loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {exercises.length === 0 ? (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    No exercises found
                  </div>
                ) : (
                  exercises.map((exercise) => (
                    <div
                      key={exercise.id}
                      className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {exercise.name}
                        </h3>
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            exercise.scope === 'global'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {exercise.scope}
                        </span>
                      </div>

                      {exercise.description && (
                        <p className="text-sm text-gray-600 mb-2">{exercise.description}</p>
                      )}

                      <div className="text-sm text-gray-500 mb-4">
                        <p>Type: <strong>{exercise.type}</strong></p>
                        {exercise.owner && (
                          <p>
                            By: <strong>{exercise.owner.pseudo}</strong>
                          </p>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(exercise)}
                          className="flex-1 px-3 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(exercise.id)}
                          className="flex-1 px-3 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
