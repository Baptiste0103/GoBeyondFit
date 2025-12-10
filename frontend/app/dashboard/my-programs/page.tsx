'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/sidebar'
import { authClient } from '@/lib/auth'
import { programClient, sessionProgressClient } from '@/lib/api-client'
import { ChevronDown, ChevronUp, CheckCircle, AlertCircle, FileDown, FileJson, Sheet } from 'lucide-react'
import { ProgramDetailModal } from '@/components/program-detail-modal'
import { generateProgramPDF, exportProgramJSON, exportProgramCSV } from '@/lib/pdf-export'

interface Exercise {
  id: string
  name: string
  description?: string
}

interface SessionExercise {
  id: string
  position: number
  exercise: Exercise
  config?: {
    sets?: number
    reps?: number
    weight?: number
  }
}

interface Session {
  id: string
  title?: string
  position: number
  date?: string
  exercises: SessionExercise[]
  progress?: any[]
}

interface Week {
  id: string
  weekNumber: number
  position: number
  sessions: Session[]
}

interface Block {
  id: string
  title?: string
  position: number
  weeks: Week[]
}

interface Program {
  id: string
  title: string
  description?: string
  blocks: Block[]
}

interface Assignment {
  id: string
  program: Program
  assignedAt: string
}

export default function MyProgramsPage() {
  const router = useRouter()
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedProgram, setExpandedProgram] = useState<string | null>(null)
  const [expandedBlock, setExpandedBlock] = useState<string | null>(null)
  const [expandedSession, setExpandedSession] = useState<string | null>(null)
  const [progressNotes, setProgressNotes] = useState<Record<string, string>>({})
  const [savingProgress, setSavingProgress] = useState<Record<string, boolean>>({})
  const [savedProgress, setSavedProgress] = useState<Record<string, boolean>>({})
  const [programStats, setProgramStats] = useState<Record<string, any>>({})
  const [selectedProgram, setSelectedProgram] = useState<Assignment | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const hasInitialized = useRef(false)

  const currentUser = authClient.getUser()

  const loadAssignments = useCallback(async () => {
    try {
      setLoading(true)
      // Fetch programs assigned to the current student
      const data = await programClient.getMyAssignments()
      setAssignments(data)
      
      // Load stats for each program
      const stats: Record<string, any> = {}
      for (const assignment of data) {
        try {
          stats[assignment.program.id] = await sessionProgressClient.getProgressStats(assignment.program.id)
        } catch (err) {
          console.error(`Failed to load stats for program ${assignment.program.id}`, err)
        }
      }
      setProgramStats(stats)
      
      setError('')
    } catch (err: any) {
      setError(err.message || 'Failed to load programs')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // Only run once on component mount
    if (hasInitialized.current) return
    hasInitialized.current = true

    if (!authClient.isAuthenticated()) {
      router.push('/auth/login')
      return
    }

    // Only students can see this page
    if (currentUser?.role !== 'student') {
      router.push('/dashboard')
      return
    }

    loadAssignments()
  }, [])

  const handleSaveProgress = async (sessionId: string, exerciseInstanceId: string) => {
    const key = `${exerciseInstanceId}`
    const notes = progressNotes[key] || ''

    if (!notes.trim()) {
      setError('Please enter some progress notes')
      return
    }

    try {
      setSavingProgress({ ...savingProgress, [key]: true })
      await sessionProgressClient.saveProgress(sessionId, exerciseInstanceId, {
        progress: { notes },
        notes,
      })
      setSavedProgress({ ...savedProgress, [key]: true })
      
      // Clear the success message after 2 seconds
      setTimeout(() => {
        setSavedProgress({ ...savedProgress, [key]: false })
      }, 2000)
      
      setProgressNotes({ ...progressNotes, [key]: '' })
      setError('')
    } catch (err: any) {
      setError(err.message || 'Failed to save progress')
    } finally {
      setSavingProgress({ ...savingProgress, [key]: false })
    }
  }

  const handleDeleteProgram = async (assignmentId: string) => {
    try {
      const token = authClient.getToken()
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/programs/${assignmentId}/assignment`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to delete program')
      }

      // Remove from assignments list
      setAssignments(assignments.filter((a) => a.id !== assignmentId))
      setIsModalOpen(false)
      setSelectedProgram(null)
    } catch (err: any) {
      throw err
    }
  }

  if (currentUser?.role !== 'student') {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="p-8">
            <div className="text-center py-8 text-gray-500">
              Access denied. Only students can view this page.
            </div>
          </div>
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
            {/* Header */}
            <h1 className="text-3xl font-bold text-gray-900 mb-8">📋 My Programs</h1>

            {/* Error */}
            {error && (
              <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            )}

            {/* Programs List */}
            {!loading && (
              <div className="space-y-4">
                {assignments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No programs assigned yet
                  </div>
                ) : (
                  assignments.map((assignment) => (
                    <div key={assignment.id} className="space-y-2">
                      {/* Program Header */}
                      <div
                        className="bg-white rounded-lg shadow p-6 hover:shadow-lg hover:bg-blue-50 transition"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h2 
                                className="text-xl font-semibold text-gray-900 cursor-pointer hover:text-blue-600"
                                onClick={() => {
                                  setSelectedProgram(assignment)
                                  setIsModalOpen(true)
                                }}
                              >
                                {assignment.program.title}
                              </h2>
                            </div>
                            {assignment.program.description && (
                              <p className="text-sm text-gray-600 mt-1">
                                {assignment.program.description}
                              </p>
                            )}
                            <p className="text-xs text-gray-500 mt-2">
                              Assigned on {new Date(assignment.assignedAt).toLocaleDateString()}
                            </p>
                            
                            {/* Progress Bar */}
                            {programStats[assignment.program.id] && (
                              <div className="mt-4">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-medium text-gray-700">Progress</span>
                                  <span className="text-sm font-semibold text-blue-600">
                                    {programStats[assignment.program.id].completionPercentage}%
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-blue-600 h-2 rounded-full transition-all"
                                    style={{
                                      width: `${programStats[assignment.program.id].completionPercentage}%`,
                                    }}
                                  />
                                </div>
                                <p className="text-xs text-gray-600 mt-1">
                                  {programStats[assignment.program.id].completedExercises} of{' '}
                                  {programStats[assignment.program.id].totalExercises} exercises completed
                                </p>
                              </div>
                            )}
                          </div>
                          
                          {/* Export Buttons */}
                          <div className="flex flex-col gap-2 ml-4">
                            <div className="flex gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  generateProgramPDF(assignment.program)
                                }}
                                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition"
                                title="Télécharger en PDF"
                              >
                                <FileDown size={16} />
                                PDF
                              </button>
                              
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  exportProgramJSON(assignment.program)
                                }}
                                className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition"
                                title="Exporter en JSON"
                              >
                                <FileJson size={16} />
                                JSON
                              </button>
                              
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  exportProgramCSV(assignment.program)
                                }}
                                className="px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition"
                                title="Exporter en CSV"
                              >
                                <Sheet size={16} />
                                CSV
                              </button>
                            </div>
                            
                            <button
                              onClick={() => {
                                setExpandedProgram(
                                  expandedProgram === assignment.program.id ? null : assignment.program.id
                                )
                              }}
                              className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg text-sm font-medium"
                            >
                              {expandedProgram === assignment.program.id ? (
                                <ChevronUp size={20} />
                              ) : (
                                <ChevronDown size={20} />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Blocks */}
                      {expandedProgram === assignment.program.id && (
                        <div className="ml-4 space-y-2">
                          {assignment.program.blocks.map((block) => (
                            <div key={block.id}>
                              {/* Block Header */}
                              <div
                                onClick={() =>
                                  setExpandedBlock(
                                    expandedBlock === block.id ? null : block.id
                                  )
                                }
                                className="bg-blue-50 rounded-lg p-4 cursor-pointer hover:bg-blue-100 transition"
                              >
                                <div className="flex justify-between items-center">
                                  <h3 className="font-medium text-gray-900">
                                    {block.title || `Block ${block.position}`}
                                  </h3>
                                  <div className="text-gray-600">
                                    {expandedBlock === block.id ? (
                                      <ChevronUp size={20} />
                                    ) : (
                                      <ChevronDown size={20} />
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Weeks */}
                              {expandedBlock === block.id && (
                                <div className="ml-4 mt-2 space-y-2">
                                  {block.weeks.map((week) => (
                                    <div key={week.id} className="space-y-2">
                                      {/* Week Header */}
                                      <div className="bg-green-50 rounded-lg p-4">
                                        <h4 className="font-medium text-gray-900">
                                          Week {week.weekNumber}
                                        </h4>
                                      </div>

                                      {/* Sessions */}
                                      <div className="ml-4 space-y-2">
                                        {week.sessions.map((session) => (
                                          <div key={session.id}>
                                            {/* Session Header */}
                                            <div
                                              onClick={() =>
                                                setExpandedSession(
                                                  expandedSession === session.id
                                                    ? null
                                                    : session.id
                                                )
                                              }
                                              className="bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-blue-300 transition"
                                            >
                                              <div className="flex justify-between items-center">
                                                <div>
                                                  <h5 className="font-medium text-gray-900">
                                                    {session.title || `Session ${session.position}`}
                                                  </h5>
                                                  {session.date && (
                                                    <p className="text-xs text-gray-500">
                                                      {new Date(session.date).toLocaleDateString()}
                                                    </p>
                                                  )}
                                                </div>
                                                <div className="text-gray-600">
                                                  {expandedSession === session.id ? (
                                                    <ChevronUp size={20} />
                                                  ) : (
                                                    <ChevronDown size={20} />
                                                  )}
                                                </div>
                                              </div>
                                            </div>

                                            {/* Exercises */}
                                            {expandedSession === session.id && (
                                              <div className="ml-4 mt-2 space-y-3">
                                                {session.exercises.map((sessionExercise) => (
                                                  <div
                                                    key={sessionExercise.id}
                                                    className="bg-white border border-gray-200 rounded-lg p-4"
                                                  >
                                                    <div className="flex justify-between items-start mb-3">
                                                      <div className="flex-1">
                                                        <h6 className="font-semibold text-gray-900">
                                                          {sessionExercise.exercise.name}
                                                        </h6>
                                                        {sessionExercise.exercise.description && (
                                                          <p className="text-sm text-gray-600 mt-1">
                                                            {sessionExercise.exercise.description}
                                                          </p>
                                                        )}
                                                      </div>
                                                      {sessionExercise.config && (
                                                        <div className="text-right text-sm text-gray-600">
                                                          {sessionExercise.config.sets && (
                                                            <div>{sessionExercise.config.sets} sets</div>
                                                          )}
                                                          {sessionExercise.config.reps && (
                                                            <div>{sessionExercise.config.reps} reps</div>
                                                          )}
                                                          {sessionExercise.config.weight && (
                                                            <div>{sessionExercise.config.weight} kg</div>
                                                          )}
                                                        </div>
                                                      )}
                                                    </div>

                                                    {/* Progress Input */}
                                                    <div className="border-t pt-3 mt-3">
                                                      <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Your Progress
                                                      </label>
                                                      <textarea
                                                        placeholder="Enter your sets, reps, weight, and notes..."
                                                        value={progressNotes[sessionExercise.id] || ''}
                                                        onChange={(e) =>
                                                          setProgressNotes({
                                                            ...progressNotes,
                                                            [sessionExercise.id]: e.target.value,
                                                          })
                                                        }
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                        rows={2}
                                                      />
                                                      <div className="flex gap-2 items-center mt-2">
                                                        <button
                                                          onClick={() =>
                                                            handleSaveProgress(session.id, sessionExercise.id)
                                                          }
                                                          disabled={savingProgress[sessionExercise.id] || !progressNotes[sessionExercise.id]}
                                                          className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm disabled:opacity-50 flex items-center gap-1"
                                                        >
                                                          <CheckCircle size={16} />
                                                          {savingProgress[sessionExercise.id] ? 'Saving...' : 'Save Progress'}
                                                        </button>
                                                        {savedProgress[sessionExercise.id] && (
                                                          <span className="text-green-600 text-sm flex items-center gap-1">
                                                            <CheckCircle size={16} />
                                                            Saved!
                                                          </span>
                                                        )}
                                                      </div>
                                                    </div>
                                                  </div>
                                                ))}
                                              </div>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Program Detail Modal */}
      <ProgramDetailModal
        assignment={selectedProgram}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedProgram(null)
        }}
        onDelete={handleDeleteProgram}
      />
    </div>
  )
}
