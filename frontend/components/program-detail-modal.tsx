'use client'

import { useState, useEffect } from 'react'
import { X, Trash2, Loader } from 'lucide-react'
import { programClient } from '@/lib/api-client'
import { ProgramWorkoutInterface } from './program-workout-interface'

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

interface ProgramDetailModalProps {
  assignment: Assignment | null
  isOpen: boolean
  onClose: () => void
  onDelete: (assignmentId: string) => Promise<void>
}

export function ProgramDetailModal({ assignment, isOpen, onClose, onDelete }: ProgramDetailModalProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [programDetails, setProgramDetails] = useState<Program | null>(null)
  const [tab, setTab] = useState<'overview' | 'workouts' | 'stats'>('overview')

  useEffect(() => {
    if (isOpen && assignment) {
      loadProgramDetails()
    }
  }, [isOpen, assignment?.id])

  const loadProgramDetails = async () => {
    if (!assignment) return

    try {
      setIsLoading(true)
      setError('')
      const details = await programClient.getProgramDetails(assignment.program.id)
      setProgramDetails(details)
    } catch (err: any) {
      setError(err.message || 'Failed to load program details')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen || !assignment) {
    return null
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to remove this program assignment? This action cannot be undone.')) {
      return
    }

    try {
      setIsDeleting(true)
      await onDelete(assignment.id)
      setSuccess('Program assignment deleted successfully')
      setTimeout(() => {
        onClose()
        setSuccess('')
      }, 1000)
    } catch (err: any) {
      setError(err.message || 'Failed to delete program assignment')
    } finally {
      setIsDeleting(false)
    }
  }

  const program = assignment.program

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-start">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">{program.title}</h2>
            {program.description && (
              <p className="text-gray-600 mt-2">{program.description}</p>
            )}
            <p className="text-sm text-gray-500 mt-2">
              Assigned on {new Date(assignment.assignedAt).toLocaleDateString()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="mx-6 mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            {success}
          </div>
        )}

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Tabs */}
          <div className="flex gap-2 border-b -mx-6 px-6">
            <button
              onClick={() => setTab('overview')}
              className={`pb-3 font-medium text-sm transition border-b-2 ${
                tab === 'overview'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Vue d'ensemble
            </button>
            <button
              onClick={() => setTab('workouts')}
              className={`pb-3 font-medium text-sm transition border-b-2 ${
                tab === 'workouts'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Mes Séances
            </button>
            <button
              onClick={() => setTab('stats')}
              className={`pb-3 font-medium text-sm transition border-b-2 ${
                tab === 'stats'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Statistiques
            </button>
          </div>

          {/* TAB: Overview */}
          {tab === 'overview' && (
            <div>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader className="animate-spin text-blue-600 mr-2" size={24} />
                  <span className="text-gray-600">Chargement des détails du programme...</span>
                </div>
              ) : !programDetails || !programDetails.blocks || programDetails.blocks.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Aucun bloc trouvé dans ce programme
                </div>
              ) : (
                programDetails.blocks.map((block) => (
                  <div key={block.id} className="border rounded-lg p-4 mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      {block.title || `Block ${block.position}`}
                    </h3>

                    <div className="space-y-4">
                      {block.weeks && block.weeks.map((week) => (
                        <div key={week.id} className="bg-gray-50 rounded-lg p-4">
                          <h4 className="font-medium text-gray-800 mb-3">
                            Semaine {week.weekNumber}
                          </h4>

                          <div className="space-y-3">
                            {week.sessions && week.sessions.map((session) => (
                              <div key={session.id} className="bg-white border border-gray-200 rounded-lg p-3">
                                <h5 className="font-medium text-gray-900 mb-2">
                                  {session.title || `Séance ${session.position}`}
                                </h5>
                                {session.date && (
                                  <p className="text-xs text-gray-500 mb-2">
                                    {new Date(session.date).toLocaleDateString('fr-FR')}
                                  </p>
                                )}

                                <div className="space-y-2">
                                  {session.exercises && session.exercises.map((exercise) => (
                                    <div key={exercise.id} className="bg-gray-50 p-2 rounded text-sm">
                                      <div className="font-medium text-gray-800">
                                        {exercise.exercise.name}
                                      </div>
                                      {exercise.exercise.description && (
                                        <p className="text-xs text-gray-600 mt-1">
                                          {exercise.exercise.description}
                                        </p>
                                      )}
                                      {exercise.config && (
                                        <div className="text-xs text-gray-600 mt-1 space-y-1">
                                          {exercise.config.sets && (
                                            <div>Sets: {exercise.config.sets}</div>
                                          )}
                                          {exercise.config.reps && (
                                            <div>Reps: {exercise.config.reps}</div>
                                          )}
                                          {exercise.config.weight && (
                                            <div>Poids: {exercise.config.weight} kg</div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB: Workouts (execute sessions) */}
          {tab === 'workouts' && assignment && (
            <ProgramWorkoutInterface 
              programId={assignment.program.id}
              assignment={assignment}
              defaultTab="sessions"
            />
          )}

          {/* TAB: Stats - will be handled by ProgramWorkoutInterface */}
          {tab === 'stats' && assignment && (
            <ProgramWorkoutInterface 
              programId={assignment.program.id}
              assignment={assignment}
              defaultTab="stats"
            />
          )}
        </div>

        {/* Footer - Delete Button */}
        <div className="sticky bottom-0 bg-white border-t p-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
          >
            Close
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2 transition"
          >
            <Trash2 size={16} />
            {isDeleting ? 'Deleting...' : 'Delete Program'}
          </button>
        </div>
      </div>
    </div>
  )
}
