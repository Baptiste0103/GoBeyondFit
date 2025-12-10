'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Play, SkipForward, CheckCircle, X, Loader } from 'lucide-react'
import { workoutClient, sessionProgressClient } from '@/lib/api-client'
import { VideoUploader } from './video-uploader'

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

interface ProgramWorkoutInterfaceProps {
  programId: string
  assignment: Assignment | null
  defaultTab?: 'overview' | 'sessions' | 'stats'
}

export function ProgramWorkoutInterface({ 
  programId,
  assignment,
  defaultTab = 'sessions'
}: ProgramWorkoutInterfaceProps) {
  const router = useRouter()
  
  // Tab state
  const [tab, setTab] = useState<'overview' | 'sessions' | 'stats'>(defaultTab)
  
  // Workout execution state
  const [currentWorkoutId, setCurrentWorkoutId] = useState<string | null>(null)
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [session, setSession] = useState<Session | null>(null)
  const [workoutSession, setWorkoutSession] = useState<any>(null)
  
  // Session status cache - maps sessionId to { message, workoutId, status }
  const [sessionStatuses, setSessionStatuses] = useState<Record<string, any>>({})
  const [loadingStatuses, setLoadingStatuses] = useState<Set<string>>(new Set())
  
  // Form data
  const [exerciseData, setExerciseData] = useState({
    setsCompleted: 0,
    repsPerSet: [] as number[],
    weight: 0,
    notes: '',
    formRating: 5,
  })
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [stats, setStats] = useState<any>(null)
  const [successMessage, setSuccessMessage] = useState('')

  // Debug logging
  useEffect(() => {
    console.log('ProgramWorkoutInterface loaded:', { programId, assignment, defaultTab })
    console.log('Assignment blocks:', assignment?.program?.blocks)
  }, [assignment])

  // Update tab when defaultTab changes
  useEffect(() => {
    console.log('defaultTab changed to:', defaultTab)
    setTab(defaultTab)
  }, [defaultTab])

  // Load stats on mount
  useEffect(() => {
    loadStats()
  }, [programId])

  const loadStats = async () => {
    try {
      const data = await sessionProgressClient.getProgressStats(programId)
      setStats(data)
    } catch (err) {
      console.error('Failed to load stats', err)
    }
  }

  // Load session status (checks if SessionProgress exists)
  const loadSessionStatus = async (sessionId: string) => {
    // Skip if already loaded
    if (sessionStatuses[sessionId]) {
      return sessionStatuses[sessionId]
    }

    try {
      setLoadingStatuses(prev => new Set(prev).add(sessionId))
      console.log('📡 [loadSessionStatus] Fetching status for session:', sessionId)
      
      const status = await workoutClient.getSessionStatus(sessionId)
      console.log('✅ [loadSessionStatus] Got status:', status)
      
      setSessionStatuses(prev => ({
        ...prev,
        [sessionId]: status
      }))
      
      return status
    } catch (err) {
      console.error('🔴 [loadSessionStatus] Error:', err)
      // Default to "not started" if there's an error
      const defaultStatus = {
        exists: false,
        status: 'not_started',
        message: 'Commencer',
        workoutId: null
      }
      setSessionStatuses(prev => ({
        ...prev,
        [sessionId]: defaultStatus
      }))
      return defaultStatus
    } finally {
      setLoadingStatuses(prev => {
        const next = new Set(prev)
        next.delete(sessionId)
        return next
      })
    }
  }

  // Start a session/workout
  const handleStartSession = async (sessionId: string) => {
    try {
      console.log('🟢 [handleStartSession] START', { sessionId })
      setLoading(true)
      setError('')
      
      console.log('🟡 [handleStartSession] Calling workoutClient.startSession...')
      const result = await workoutClient.startSession(sessionId)
      console.log('🟢 [handleStartSession] SUCCESS', { result })
      
      // Redirect to workouts page with sessionProgressId
      const sessionProgressId = result.sessionProgressId || result.workoutId
      console.log('🟡 [handleStartSession] Redirecting to /workouts/' + sessionProgressId)
      router.push(`/workouts/${sessionProgressId}`)
      
    } catch (err: any) {
      console.error('🔴 [handleStartSession] ERROR', err)
      setError(err.message || 'Failed to start session')
      setLoading(false)
    }
  }

  // Complete an exercise
  const handleCompleteExercise = async () => {
    if (!currentWorkoutId || !session) return

    try {
      setLoading(true)
      setError('')
      
      // Save exercise progress
      await workoutClient.completeExercise(
        currentWorkoutId,
        currentExerciseIndex,
        {
          setsCompleted: exerciseData.setsCompleted,
          repsPerSet: exerciseData.repsPerSet,
          weight: exerciseData.weight,
          notes: exerciseData.notes,
          formRating: exerciseData.formRating,
        }
      )
      
      setSuccessMessage('✅ Exercice complété!')
      setTimeout(() => setSuccessMessage(''), 2000)
      
      // Move to next exercise
      if (currentExerciseIndex < session.exercises.length - 1) {
        setCurrentExerciseIndex(currentExerciseIndex + 1)
        setExerciseData({
          setsCompleted: 0,
          repsPerSet: [],
          weight: 0,
          notes: '',
          formRating: 5,
        })
      }
      
    } catch (err: any) {
      setError(err.message || 'Failed to complete exercise')
      console.error('Failed to complete exercise', err)
    } finally {
      setLoading(false)
    }
  }

  // Skip an exercise
  const handleSkipExercise = async () => {
    if (!currentWorkoutId || !session) return

    try {
      setLoading(true)
      setError('')
      
      // Skip the exercise
      await workoutClient.skipExercise(
        currentWorkoutId,
        currentExerciseIndex,
        'Skipped by user'
      )
      
      setSuccessMessage('⏭️ Exercice sauté')
      setTimeout(() => setSuccessMessage(''), 2000)
      
      // Move to next exercise
      if (currentExerciseIndex < session.exercises.length - 1) {
        setCurrentExerciseIndex(currentExerciseIndex + 1)
        setExerciseData({
          setsCompleted: 0,
          repsPerSet: [],
          weight: 0,
          notes: '',
          formRating: 5,
        })
      }
      
    } catch (err: any) {
      setError(err.message || 'Failed to skip exercise')
      console.error('Failed to skip exercise', err)
    } finally {
      setLoading(false)
    }
  }

  // End the session/workout
  const handleEndSession = async () => {
    if (!currentWorkoutId) return

    try {
      setLoading(true)
      setError('')
      
      // End the workout
      await workoutClient.endSession(currentWorkoutId)
      
      setSuccessMessage('✅ Séance terminée!')
      setTimeout(() => setSuccessMessage(''), 2000)
      
      // Reset state
      setCurrentWorkoutId(null)
      setSession(null)
      setExerciseData({
        setsCompleted: 0,
        repsPerSet: [],
        weight: 0,
        notes: '',
        formRating: 5,
      })
      
      // Reload stats
      await loadStats()
      
      // Switch to stats tab to show updated progress
      setTab('stats')
      
    } catch (err: any) {
      setError(err.message || 'Failed to end session')
      console.error('Failed to end session', err)
    } finally {
      setLoading(false)
    }
  }

  // If in workout mode, show exercise execution interface
  if (currentWorkoutId && session && session.exercises.length > 0) {
    const currentExercise = session.exercises[currentExerciseIndex]
    const progress = currentExerciseIndex + 1
    const isLastExercise = currentExerciseIndex === session.exercises.length - 1

    return (
      <div className="space-y-4">
        {/* Progress Header */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-lg">
              {session.title || 'Séance'}
            </h3>
            <span className="text-sm text-gray-600">
              {progress}/{session.exercises.length}
            </span>
          </div>
          <div className="bg-white rounded-full h-3 overflow-hidden">
            <div 
              className="bg-blue-600 h-full transition-all duration-300"
              style={{ width: `${(progress / session.exercises.length) * 100}%` }}
            />
          </div>
          <p className="text-xs text-gray-600 mt-2">
            {progress - 1} complétés • {session.exercises.length - progress} à faire
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-sm flex justify-between items-center">
            <span>{error}</span>
            <button 
              onClick={() => setError('')}
              className="text-red-700 hover:text-red-900"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg text-sm">
            {successMessage}
          </div>
        )}

        {/* Current Exercise */}
        <div className="bg-white border rounded-lg p-4 space-y-4">
          {/* Exercise Name */}
          <div>
            <h4 className="font-bold text-lg text-gray-900">
              {progress}. {currentExercise.exercise.name}
            </h4>
            {currentExercise.exercise.description && (
              <p className="text-sm text-gray-600 mt-1">
                {currentExercise.exercise.description}
              </p>
            )}
          </div>

          {/* Exercise Config (Coach's prescribed parameters) */}
          {currentExercise.config && (
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
              <p className="text-xs font-medium text-blue-800 mb-2">Paramètres prescrits:</p>
              <div className="space-y-1 text-sm text-blue-900">
                {currentExercise.config.sets && (
                  <div>• Sets: {currentExercise.config.sets}</div>
                )}
                {currentExercise.config.reps && (
                  <div>• Reps: {currentExercise.config.reps}</div>
                )}
                {currentExercise.config.weight && (
                  <div>• Poids: {currentExercise.config.weight} kg</div>
                )}
              </div>
            </div>
          )}

          {/* Form: Student's actual performance */}
          <div className="space-y-3 border-t pt-4">
            <p className="text-xs font-medium text-gray-600 uppercase">Votre performance:</p>
            
            {/* Sets Completed */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sets complétés
              </label>
              <input
                type="number"
                min="0"
                max={currentExercise.config?.sets || 10}
                value={exerciseData.setsCompleted}
                onChange={(e) => setExerciseData({ 
                  ...exerciseData, 
                  setsCompleted: parseInt(e.target.value) || 0
                })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
            </div>

            {/* Weight */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Poids utilisé (kg)
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={exerciseData.weight}
                onChange={(e) => setExerciseData({ 
                  ...exerciseData, 
                  weight: parseFloat(e.target.value) || 0
                })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
            </div>

            {/* Form Rating (RPE - Rate of Perceived Exertion) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulté ressentie (RPE 1-10)
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => setExerciseData({ 
                      ...exerciseData, 
                      formRating: rating 
                    })}
                    className={`flex-1 py-2 rounded text-sm font-medium transition ${
                      exerciseData.formRating === rating
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                    disabled={loading}
                  >
                    {rating}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (observations, sensations, etc.)
              </label>
              <textarea
                value={exerciseData.notes}
                onChange={(e) => setExerciseData({ 
                  ...exerciseData, 
                  notes: e.target.value 
                })}
                placeholder="Ex: Très fatigué aujourd'hui, forme pas au top..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={2}
                disabled={loading}
              />
            </div>

            {/* Video Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vidéo (optionnel)
              </label>
              <VideoUploader 
                onUploadSuccess={(videoId) => {
                  console.log('Video uploaded:', videoId)
                  setSuccessMessage('✅ Vidéo uploadée!')
                  setTimeout(() => setSuccessMessage(''), 2000)
                }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="border-t pt-4 space-y-2">
            <div className="flex gap-2">
              <button
                onClick={handleSkipExercise}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-orange-400 text-orange-600 rounded-lg hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition"
              >
                <SkipForward size={18} />
                Sauter
              </button>
              <button
                onClick={handleCompleteExercise}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition"
              >
                {loading ? (
                  <Loader size={18} className="animate-spin" />
                ) : (
                  <CheckCircle size={18} />
                )}
                Compléter
              </button>
            </div>

            {/* End Session Button (for last exercise) */}
            {isLastExercise && (
              <button
                onClick={handleEndSession}
                disabled={loading}
                className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition"
              >
                {loading ? (
                  <Loader size={18} className="animate-spin inline mr-2" />
                ) : null}
                Terminer la séance
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Normal tab view (not in workout mode)
  return (
    <div className="space-y-4">
      {/* TAB: Overview */}
      {tab === 'overview' && assignment?.program?.blocks && (
        <div className="space-y-4">
          {assignment.program.blocks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Aucun bloc dans ce programme
            </div>
          ) : (
            assignment.program.blocks.map((block) => (
              <div key={block.id} className="border rounded-lg p-4">
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
                              {session.exercises && session.exercises.map((exercise, idx) => (
                                <div key={exercise.id} className="bg-gray-50 p-2 rounded text-sm">
                                  <div className="font-medium text-gray-800">
                                    {idx + 1}. {exercise.exercise.name}
                                  </div>
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

      {/* TAB: Sessions */}
      {tab === 'sessions' && (
        <div className="space-y-4">
          {!assignment?.program?.blocks || assignment.program.blocks.length === 0 ? (
            <div className="text-center py-8 text-gray-500 border border-red-300 bg-red-50 p-4 rounded">
              <p>Aucune séance disponible</p>
              {!assignment && <p className="text-xs mt-2 text-red-600">❌ Assignment is null/undefined</p>}
              {assignment && !assignment.program?.blocks && <p className="text-xs mt-2 text-red-600">❌ No blocks in program</p>}
              <p className="text-xs mt-2">Debug: assignment={JSON.stringify(assignment ? { id: assignment.id, programId: assignment.program?.id } : null)}</p>
            </div>
          ) : (
            assignment.program.blocks.map((block) => (
              <div key={block.id}>
                <h3 className="font-bold text-gray-900 mb-3">
                  {block.title || `Block ${block.position}`}
                </h3>
                
                {block.weeks?.map((week) => (
                  <div key={week.id} className="ml-0 mb-4">
                    <h4 className="text-sm font-medium text-gray-600 mb-2 px-4">
                      Semaine {week.weekNumber}
                    </h4>
                    
                    <div className="space-y-2">
                      {week.sessions?.map((session) => (
                        <div 
                          key={session.id}
                          className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:bg-gray-100 transition"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">
                                {session.title || `Séance ${session.position}`}
                              </p>
                              <p className="text-xs text-gray-600 mt-1">
                                {session.exercises?.length || 0} exercices
                              </p>
                              {session.date && (
                                <p className="text-xs text-gray-500 mt-1">
                                  {new Date(session.date).toLocaleDateString('fr-FR')}
                                </p>
                              )}
                            </div>
                            <SessionStartButton 
                              session={session}
                              onStartSession={handleStartSession}
                              loading={loading}
                              sessionStatus={sessionStatuses[session.id]}
                              isLoadingStatus={loadingStatuses.has(session.id)}
                              onLoadStatus={loadSessionStatus}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB: Stats */}
      {tab === 'stats' && (
        <div className="space-y-4">
          {stats ? (
            <>
              {/* Overall Progress */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800 font-medium mb-2">Progression du programme</p>
                <h3 className="text-3xl font-bold text-blue-600 mb-3">
                  {Math.round(stats.completionRate || 0)}%
                </h3>
                <div className="bg-white rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-blue-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${stats.completionRate || 0}%` }}
                  />
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <p className="text-xs text-gray-600 font-medium uppercase mb-2">Séances</p>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.completedSessions || 0}
                    </p>
                    <p className="text-xs text-gray-500">
                      sur {stats.totalSessions || '?'}
                    </p>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <p className="text-xs text-gray-600 font-medium uppercase mb-2">Exercices</p>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.completedExercises || 0}
                    </p>
                    <p className="text-xs text-gray-500">
                      sur {stats.totalExercises || '?'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Last Session Info */}
              {stats.lastSessionDate && (
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <p className="text-xs text-gray-600 font-medium uppercase mb-2">Dernière séance</p>
                  <p className="text-gray-900 font-medium">
                    {new Date(stats.lastSessionDate).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Loader size={32} className="animate-spin mx-auto mb-2 text-gray-400" />
              Chargement des statistiques...
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// SessionStartButton sub-component
interface SessionStartButtonProps {
  session: Session
  onStartSession: (sessionId: string) => void
  loading: boolean
  sessionStatus?: any
  isLoadingStatus: boolean
  onLoadStatus: (sessionId: string) => Promise<any>
}

function SessionStartButton({
  session,
  onStartSession,
  loading,
  sessionStatus,
  isLoadingStatus,
  onLoadStatus,
}: SessionStartButtonProps) {
  const [mounted, setMounted] = useState(false)

  // Load status when component mounts
  useEffect(() => {
    setMounted(true)
    if (!sessionStatus) {
      onLoadStatus(session.id)
    }
  }, [session.id, sessionStatus, onLoadStatus])

  if (!mounted) {
    return (
      <button
        disabled
        className="flex items-center gap-2 px-4 py-2 bg-gray-400 text-white rounded-lg font-medium text-sm whitespace-nowrap ml-4 opacity-50"
      >
        <Loader size={16} className="animate-spin" />
        Chargement...
      </button>
    )
  }

  // Determine button appearance based on status
  const isLoading = loading || isLoadingStatus
  const status = sessionStatus?.status || 'not_started'
  const message = sessionStatus?.message || 'Commencer'
  
  let buttonClass = 'flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition whitespace-nowrap ml-4'
  let buttonColorClass = 'bg-blue-600 text-white hover:bg-blue-700'
  let icon = <Play size={16} />

  // Different colors for different statuses
  if (status === 'in_progress') {
    buttonColorClass = 'bg-amber-600 text-white hover:bg-amber-700'
    icon = <SkipForward size={16} />
  } else if (status === 'completed') {
    buttonColorClass = 'bg-green-600 text-white hover:bg-green-700'
    icon = <CheckCircle size={16} />
  }

  const disabledClass = isLoading ? 'disabled:opacity-50 disabled:cursor-not-allowed' : ''

  return (
    <button
      onClick={() => {
        console.log('🔵 [SessionStartButton clicked]', { sessionId: session.id, status, message })
        onStartSession(session.id)
      }}
      disabled={isLoading}
      className={`${buttonClass} ${buttonColorClass} ${disabledClass}`}
      title={`Status: ${status} - ${message}`}
    >
      {isLoading ? <Loader size={16} className="animate-spin" /> : icon}
      {message}
    </button>
  )
}
