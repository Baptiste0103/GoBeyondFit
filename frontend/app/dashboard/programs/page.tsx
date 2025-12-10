'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/sidebar'
import { ProgramAssignmentManager } from '@/components/program-assignment-manager'
import { authClient } from '@/lib/auth'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

interface Program {
  id: string
  title: string
  description?: string
  isDraft: boolean
  createdAt: string
  blocks?: any[]
}

export default function ProgramsPage() {
  const router = useRouter()
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    isDraft: true,
  })

  useEffect(() => {
    // Check if user is authenticated and token is not expired
    if (!authClient.isAuthenticated()) {
      router.push('/auth/login')
      return
    }

    const user = authClient.getUser()
    if (!user) {
      router.push('/auth/login')
      return
    }
    loadPrograms()
  }, [router])

  const loadPrograms = async () => {
    try {
      setLoading(true)
      const token = authClient.getToken()
      if (!token) {
        router.push('/auth/login')
        return
      }
      const response = await fetch(`${API_URL}/programs`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) throw new Error('Failed to load programs')
      const data = await response.json()
      setPrograms(Array.isArray(data) ? data : [])
    } catch (err: any) {
      setError(err.message)
      setPrograms([])
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProgram = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = authClient.getToken()
      if (!token) {
        setError('No authentication token found. Please login again.')
        return
      }
      const response = await fetch(`${API_URL}/programs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          blocks: [],
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData?.message || `Failed to create program (${response.status})`
        throw new Error(errorMessage)
      }
      
      setFormData({ title: '', description: '', isDraft: true })
      setShowForm(false)
      await loadPrograms()
    } catch (err: any) {
      setError(err.message)
      console.error('Create program error:', err)
    }
  }

  const handleDeleteProgram = async (id: string) => {
    if (!confirm('Delete this program?')) return

    try {
      const token = authClient.getToken()
      if (!token) {
        setError('No authentication token found. Please login again.')
        return
      }
      const response = await fetch(`${API_URL}/programs/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) throw new Error('Failed to delete program')
      await loadPrograms()
    } catch (err: any) {
      setError(err.message)
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />

      <main className="flex-1 overflow-auto">
        <div className="p-8 md:ml-0">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900">📋 Programs</h1>
              {!showForm && (
                <button
                  onClick={() => setShowForm(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  + Create Program
                </button>
              )}
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                {error}
              </div>
            )}

            {/* Create Form */}
            {showForm && (
              <div className="mb-8 bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Create New Program</h2>
                <form onSubmit={handleCreateProgram} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Title *</label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                      placeholder="e.g., 12-Week Strength Program"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                      placeholder="Program description..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.isDraft}
                        onChange={(e) => setFormData({ ...formData, isDraft: e.target.checked })}
                        className="h-4 w-4 text-blue-600"
                      />
                      <span className="ml-2 text-sm text-gray-700">Save as Draft</span>
                    </label>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      Create
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Programs Grid */}
            {programs.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <p className="text-gray-500 mb-4">No programs yet</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Create Your First Program
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {programs.map((program) => (
                  <div key={program.id}>
                    <div className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition">
                      <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{program.title}</h3>
                        {program.description && (
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{program.description}</p>
                        )}

                        <div className="mb-4 text-xs text-gray-500 space-y-1">
                          <div>📦 Blocks: {program.blocks?.length || 0}</div>
                          <div>📅 Created: {new Date(program.createdAt).toLocaleDateString()}</div>
                          <div>Status: {program.isDraft ? '📝 Draft' : '✅ Published'}</div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => router.push(`/programs/builder/${program.id}`)}
                            className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setSelectedProgramId(selectedProgramId === program.id ? null : program.id)}
                            className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition"
                          >
                            {selectedProgramId === program.id ? 'Close' : 'Assign'}
                          </button>
                          <button
                            onClick={() => handleDeleteProgram(program.id)}
                            className="px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Program Assignment Manager */}
                    {selectedProgramId === program.id && (
                      <div className="mt-4">
                        <ProgramAssignmentManager programId={program.id} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
