'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/sidebar'
import { authClient } from '@/lib/auth'
import { Calendar, Play, Clock } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000'

interface Session {
  id: string
  title?: string
  date?: string
  week: {
    weekNumber: number
    block: {
      title?: string
      program: {
        title: string
      }
    }
  }
  exercises: any[]
  progress: any[]
}

export default function WorkoutsPage() {
  const router = useRouter()
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending'>('all')

  const token = authClient.getToken()

  useEffect(() => {
    const user = authClient.getUser()
    if (!user || user.role !== 'student') {
      router.push('/auth/login')
      return
    }
    loadSessions()
  }, [router])

  const loadSessions = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/workouts/my-sessions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to load sessions')
      }

      const data = await response.json()
      setSessions(data)
      setError('')
    } catch (err: any) {
      setError(err.message || 'Failed to load sessions')
    } finally {
      setLoading(false)
    }
  }

  const getFilteredSessions = () => {
    if (filter === 'completed') {
      return sessions.filter((s) => s.progress?.some((p: any) => p.progress?.completed))
    }
    if (filter === 'pending') {
      return sessions.filter((s) => !s.progress?.some((p: any) => p.progress?.completed))
    }
    return sessions
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'À déterminer'
    const date = new Date(dateStr)
    return date.toLocaleDateString('fr-FR', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
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

  const filtered = getFilteredSessions()

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />

      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">💪 Mes Séances</h1>
              <p className="text-gray-600">
                {filtered.length} séance{filtered.length !== 1 ? 's' : ''} {filter !== 'all' ? filter : 'disponible'}
              </p>
            </div>

            {/* Filters */}
            <div className="flex gap-2 mb-8">
              {['all', 'pending', 'completed'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f as any)}
                  className={`px-4 py-2 rounded-lg font-semibold transition ${
                    filter === f
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                  }`}
                >
                  {f === 'all' ? 'Toutes' : f === 'pending' ? 'En attente' : 'Complétées'}
                </button>
              ))}
            </div>

            {/* Error */}
            {error && (
              <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            {/* Sessions Grid */}
            {filtered.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <Calendar className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg">
                  {filter === 'all'
                    ? 'Aucune séance assignée'
                    : filter === 'pending'
                    ? 'Aucune séance en attente'
                    : 'Aucune séance complétée'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((session) => {
                  const isCompleted = session.progress?.some((p: any) => p.progress?.completed)
                  return (
                    <div
                      key={session.id}
                      className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition"
                    >
                      {/* Status Badge */}
                      <div
                        className={`h-2 ${isCompleted ? 'bg-green-500' : 'bg-blue-500'}`}
                      />

                      <div className="p-6">
                        {/* Title */}
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {session.title || `Séance ${session.week.weekNumber}`}
                        </h3>

                        {/* Program & Week */}
                        <p className="text-sm text-gray-600 mb-3">
                          <strong>{session.week.block.program.title}</strong>
                          {session.week.block.title && ` - ${session.week.block.title}`}
                        </p>

                        {/* Metadata */}
                        <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar size={16} />
                            {formatDate(session.date)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Play size={16} />
                            {session.exercises?.length || 0} exercices
                          </div>
                          {isCompleted && (
                            <div className="flex items-center gap-1 text-green-600 font-semibold">
                              ✓ Complétée
                            </div>
                          )}
                        </div>

                        {/* Exercises Preview */}
                        <div className="space-y-2 mb-4">
                          {session.exercises?.slice(0, 3).map((ex, i) => {
                            const config = ex.config as any;
                            return (
                              <div key={i} className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                                <div className="font-medium">{ex.exercise?.name}</div>
                                {config && (
                                  <div className="text-xs text-gray-600 mt-1 space-y-1">
                                    {config.sets && <div>📊 {config.sets} séries</div>}
                                    {config.reps && <div>🔄 {config.reps} répétitions</div>}
                                    {config.weight && <div>⚖️ {config.weight} kg</div>}
                                    {config.format && <div>🎯 {config.format}</div>}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                          {session.exercises?.length > 3 && (
                            <div className="text-sm text-gray-500 italic">
                              +{session.exercises.length - 3} autre{session.exercises.length - 3 > 1 ? 's' : ''}
                            </div>
                          )}
                        </div>

                        {/* Action Button */}
                        {isCompleted ? (
                          <button
                            onClick={() => router.push(`/workouts/${session.id}`)}
                            className="w-full py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold transition"
                          >
                            Voir les résultats
                          </button>
                        ) : (
                          <button
                            onClick={() => router.push(`/workouts/${session.id}`)}
                            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition flex items-center justify-center gap-2"
                          >
                            <Play size={18} />
                            Commencer
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
