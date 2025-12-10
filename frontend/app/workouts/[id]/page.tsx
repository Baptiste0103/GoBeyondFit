'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Sidebar from '@/components/sidebar'
import { authClient } from '@/lib/auth'
import { VideoUploader } from '@/components/video-uploader'
import { Check, ChevronDown, ChevronUp, Trash2, Save } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000'

interface ExerciseConfig {
  weight?: number
  reps?: number
  sets?: number
  format?: string
  duration?: number
  notes?: string
}

interface SessionExercise {
  id: string
  exerciseId: string
  exercise: {
    id: string
    name: string
    description?: string
  }
  config?: ExerciseConfig
  position: number
  progressInstances: any[]
}

interface Session {
  id: string
  title?: string
  notes?: string
  date?: string | null
  exercises: SessionExercise[]
  week: {
    weekNumber: number
    block: {
      title?: string
      program: {
        title: string
      }
    }
  }
}

interface ExerciseProgress {
  sets: number
  reps: number
  weight?: number
  completed: boolean
  notes?: string
  rpe?: number  // Added: Rate of Perceived Exertion (1-10)
  videoUrl?: string
  format?: string  // Exercise format: standard, EMOM, AMRAP, circuit
  totalReps?: number  // For AMRAP/circuit
  roundsCompleted?: number  // For circuit
}

export default function WorkoutPage() {
  const router = useRouter()
  const params = useParams()
  const workoutId = params.id as string

  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [expandedExercises, setExpandedExercises] = useState<number[]>([])

  // Progress tracking
  const [exerciseProgress, setExerciseProgress] = useState<Record<string, ExerciseProgress[]>>({})
  const [exerciseNotes, setExerciseNotes] = useState<Record<string, string>>({})  // Notes per exercise
  const [isSaving, setSaving] = useState(false)
  const [workoutStatus, setWorkoutStatus] = useState<string>('not_started')
  const [saveMessage, setSaveMessage] = useState('')
  const [noteSaveStatus, setNoteSaveStatus] = useState<Record<string, 'saving' | 'saved' | 'error' | undefined>>({})
  
  // Autosave refs
  const debounceTimeoutsRef = useRef<Record<string, NodeJS.Timeout>>({})
  const periodicalBackupIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const token = authClient.getToken()

  useEffect(() => {
    if (!authClient.isAuthenticated()) {
      router.push('/auth/login')
      return
    }
    loadSession()
  }, [workoutId, router])

  const loadSession = async () => {
    try {
      setLoading(true)
      console.log('🔵 [loadSession] START - workoutId:', workoutId)
      
      // Load the WorkoutSession to get the session details
      const workoutResponse = await fetch(`${API_URL}/workouts/${workoutId}/progress`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!workoutResponse.ok) {
        const errorText = await workoutResponse.text()
        console.error('🔴 [loadSession] Response not ok:', workoutResponse.status, errorText)
        throw new Error(`Failed to load workout: ${workoutResponse.status}`)
      }

      const workoutData = await workoutResponse.json()
      console.log('🟢 [loadSession] API Response:', workoutData)
      
      // Extract the actual session from the response
      if (!workoutData.session) {
        console.error('🔴 [loadSession] No session in response:', workoutData)
        throw new Error('No session data in response')
      }
      
      setSession(workoutData.session)
      // Update workout status from response
      if (workoutData.status) {
        setWorkoutStatus(workoutData.status)
        console.log('🟢 [loadSession] Workout status:', workoutData.status)
      }
      console.log('🟢 [loadSession] Session set:', workoutData.session)

      // Initialize progress tracking from SessionProgress data
      const progress: Record<string, ExerciseProgress[]> = {}
      
      // If we have SessionProgress with saved data, use it as the source of truth
      if (workoutData.sessionProgress?.progress?.exercises) {
        console.log('🟢 [loadSession] Loading from SessionProgress.progress.exercises')
        const savedExercises = workoutData.sessionProgress.progress.exercises
        
        // Match saved exercises to session exercises by position
        if (workoutData.session?.exercises) {
          workoutData.session.exercises.forEach((ex: SessionExercise) => {
            // Find corresponding saved exercise by position
            const savedExercise = savedExercises.find((e: any) => e.position === ex.position)
            
            if (savedExercise && savedExercise.data) {
              const savedData = savedExercise.data
              console.log(`🟢 [loadSession] Loaded saved data for exercise at position ${ex.position}:`, savedData)
              
              // For standard exercises, data contains individual sets info
              if (Array.isArray(savedData.repsPerSet)) {
                // Multiple sets stored as array
                progress[ex.id] = savedData.repsPerSet.map((reps: number, setIndex: number) => ({
                  sets: savedData.setsCompleted || savedData.repsPerSet.length,
                  reps: reps,
                  weight: savedData.weightUsed || ex.config?.weight,
                  completed: savedExercise.status === 'completed',
                  notes: savedExercise.notes || savedData.notes || '',
                  rpe: savedData.rpe || undefined,
                  format: ex.config?.format,
                  videoUrl: (savedExercise.videos && savedExercise.videos[0]) || '',
                }))
              } else if (savedData.setsCompleted || savedData.totalReps !== undefined || savedData.roundsCompleted !== undefined) {
                // Single set or legacy format or AMRAP/circuit
                progress[ex.id] = [
                  {
                    sets: savedData.setsCompleted || 1,
                    reps: savedData.repsCompleted || 0,
                    weight: savedData.weightUsed || ex.config?.weight,
                    completed: savedExercise.status === 'completed',
                    notes: savedExercise.notes || savedData.notes || '',
                    rpe: savedData.rpe || undefined,
                    format: ex.config?.format,
                    totalReps: savedData.totalReps,
                    roundsCompleted: savedData.roundsCompleted,
                    videoUrl: (savedExercise.videos && savedExercise.videos[0]) || '',
                  },
                ]
              } else {
                // No data, use config defaults
                progress[ex.id] = [
                  {
                    sets: ex.config?.sets || 1,
                    reps: ex.config?.reps || 0,
                    weight: ex.config?.weight,
                    completed: false,
                    notes: '',
                    rpe: undefined,
                    format: ex.config?.format,
                  },
                ]
              }
            } else {
              // No saved data for this exercise, use config defaults
              progress[ex.id] = [
                {
                  sets: ex.config?.sets || 1,
                  reps: ex.config?.reps || 0,
                  weight: ex.config?.weight,
                  completed: false,
                  notes: '',
                },
              ]
            }
          })
        }
      } else {
        // No SessionProgress, initialize from session config only
        console.log('🟢 [loadSession] No SessionProgress found, using config defaults')
        if (workoutData.session?.exercises) {
          workoutData.session.exercises.forEach((ex: SessionExercise) => {
            progress[ex.id] = [
              {
                sets: ex.config?.sets || 1,
                reps: ex.config?.reps || 0,
                weight: ex.config?.weight,
                completed: false,
                notes: '',
                format: ex.config?.format,
              },
            ]
          })
        }
      }
      
      setExerciseProgress(progress)
      
      // Load exercise notes from SessionProgress
      const notesMap: Record<string, string> = {}
      if (workoutData.sessionProgress?.progress?.exercises && workoutData.session?.exercises) {
        // Match saved exercises to session exercises by position
        workoutData.sessionProgress.progress.exercises.forEach((savedEx: any, index: number) => {
          const sessionExercise = workoutData.session.exercises[index]
          if (sessionExercise?.id) {
            // Notes are stored in savedEx.data.notes for all exercise types
            const notes = savedEx.data?.notes || savedEx.notes || ''
            if (notes) {
              notesMap[sessionExercise.id] = notes
              console.log(`🟢 [loadSession] Loaded notes for exercise ${sessionExercise.id}:`, notes)
            }
          }
        })
      }
      setExerciseNotes(notesMap)
      console.log('🟢 [loadSession] All exercise notes loaded:', notesMap)
    } catch (err: any) {
      console.error('🔴 [loadSession] ERROR:', err)
      setError(err.message || 'Failed to load session')
    } finally {
      setLoading(false)
    }
  }

  const toggleExerciseExpanded = (index: number) => {
    setExpandedExercises((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    )
  }

  const updateExerciseProgress = (exerciseId: string, setIndex: number, field: string, value: any) => {
    setExerciseProgress((prev) => {
      const updated = { ...prev }
      if (!updated[exerciseId]) updated[exerciseId] = []
      if (!updated[exerciseId][setIndex]) {
        updated[exerciseId][setIndex] = {
          sets: 1,
          reps: 0,
          completed: false,
        }
      }
      updated[exerciseId][setIndex] = {
        ...updated[exerciseId][setIndex],
        [field]: value,
      }
      return updated
    })
  }

  const addSet = (exerciseId: string) => {
    setExerciseProgress((prev) => {
      const updated = { ...prev }
      const lastSet = updated[exerciseId]?.[updated[exerciseId].length - 1] || {
        sets: 1,
        reps: 0,
        completed: false,
      }
      updated[exerciseId] = [
        ...(updated[exerciseId] || []),
        {
          sets: (lastSet.sets || 1) + 1,
          reps: lastSet.reps || 0,
          weight: lastSet.weight,
          completed: false,
          videoUrl: undefined,
        },
      ]
      return updated
    })
  }

  const removeSet = (exerciseId: string, setIndex: number) => {
    setExerciseProgress((prev) => {
      const updated = { ...prev }
      if (updated[exerciseId]) {
        updated[exerciseId] = updated[exerciseId].filter((_, i) => i !== setIndex)
      }
      return updated
    })
  }

  /**
   * Auto-save individual exercise note
   * Called with debounce on change, forced on blur, and periodic backup
   */
  const saveNoteToServer = async (exerciseId: string, noteContent: string, trigger: 'debounce' | 'blur' | 'periodic' = 'debounce') => {
    // Don't save empty notes
    if (!noteContent || !noteContent.trim()) {
      setNoteSaveStatus(prev => ({ ...prev, [exerciseId]: undefined }))
      return
    }

    try {
      setNoteSaveStatus(prev => ({ ...prev, [exerciseId]: 'saving' }))
      console.log(`🔵 [saveNoteToServer] Saving note (trigger: ${trigger}) for exercise ${exerciseId}:`, noteContent)

      // Find the exercise index
      const exerciseIndex = session?.exercises?.findIndex(ex => ex.id === exerciseId)
      if (exerciseIndex === undefined || exerciseIndex === -1) {
        console.error('🔴 [saveNoteToServer] Exercise not found')
        throw new Error('Exercise not found')
      }

      // Build payload with only the note for this exercise
      const payload = {
        notes: noteContent,
        setsCompleted: 0, // Just saving note, no progress change
        repsPerSet: [],
        videos: [],
      }

      const response = await fetch(
        `${API_URL}/workouts/${workoutId}/exercise/${exerciseIndex}/save`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      )

      if (!response.ok) {
        const errorText = await response.text()
        console.error('🔴 [saveNoteToServer] Error response:', errorText)
        throw new Error(`Failed to save note: ${response.status}`)
      }

      const result = await response.json()
      console.log(`🟢 [saveNoteToServer] Note saved successfully (trigger: ${trigger})`, result)

      setNoteSaveStatus(prev => ({ ...prev, [exerciseId]: 'saved' }))
      // Clear success status after 2 seconds
      setTimeout(() => {
        setNoteSaveStatus(prev => ({ ...prev, [exerciseId]: undefined }))
      }, 2000)

    } catch (err: any) {
      console.error('🔴 [saveNoteToServer] ERROR:', err)
      setNoteSaveStatus(prev => ({ ...prev, [exerciseId]: 'error' }))
      // Clear error status after 4 seconds
      setTimeout(() => {
        setNoteSaveStatus(prev => ({ ...prev, [exerciseId]: undefined }))
      }, 4000)
    }
  }

  /**
   * Handle note change with debounced autosave
   */
  const handleNoteChange = (exerciseId: string, value: string) => {
    // Update local state immediately
    setExerciseNotes(prev => ({
      ...prev,
      [exerciseId]: value
    }))

    // Clear any existing debounce timeout for this exercise
    if (debounceTimeoutsRef.current[exerciseId]) {
      clearTimeout(debounceTimeoutsRef.current[exerciseId])
    }

    // Set new debounce timeout (1 second of inactivity)
    debounceTimeoutsRef.current[exerciseId] = setTimeout(() => {
      saveNoteToServer(exerciseId, value, 'debounce')
    }, 1000)
  }

  /**
   * Handle note blur - force save immediately
   */
  const handleNoteBlur = (exerciseId: string) => {
    const noteContent = exerciseNotes[exerciseId]
    // Clear any pending debounce
    if (debounceTimeoutsRef.current[exerciseId]) {
      clearTimeout(debounceTimeoutsRef.current[exerciseId])
    }
    // Save immediately
    if (noteContent && noteContent.trim()) {
      saveNoteToServer(exerciseId, noteContent, 'blur')
    }
  }

  /**
   * Setup periodic backup - saves all notes every 2 minutes
   */
  useEffect(() => {
    periodicalBackupIntervalRef.current = setInterval(() => {
      console.log('🔄 [periodicalBackup] Running periodic backup of all notes...')
      Object.entries(exerciseNotes).forEach(([exerciseId, noteContent]) => {
        if (noteContent && noteContent.trim()) {
          saveNoteToServer(exerciseId, noteContent, 'periodic')
        }
      })
    }, 120000) // Every 2 minutes

    return () => {
      if (periodicalBackupIntervalRef.current) {
        clearInterval(periodicalBackupIntervalRef.current)
      }
    }
  }, [exerciseNotes, workoutId, token])

  /**
   * Cleanup debounce timeouts on unmount
   */
  useEffect(() => {
    return () => {
      Object.values(debounceTimeoutsRef.current).forEach(timeout => clearTimeout(timeout))
      if (periodicalBackupIntervalRef.current) {
        clearInterval(periodicalBackupIntervalRef.current)
      }
    }
  }, [])

  const handleVideoUpload = (exerciseId: string, setIndex: number, videoUrl: string) => {
    updateExerciseProgress(exerciseId, setIndex, 'videoUrl', videoUrl)
  }

  const saveProgress = async (markAsCompleted: boolean = false) => {
    if (!session?.exercises?.[currentExerciseIndex]) {
      console.error('🔴 [saveProgress] No current exercise found')
      setError('No exercise selected')
      return
    }

    try {
      setSaving(true)
      setError('')
      const currentExercise = session.exercises[currentExerciseIndex]
      const progress = exerciseProgress[currentExercise.id] || []

      console.log('🔵 [saveProgress] START - exerciseId:', currentExercise.id)
      console.log('🔵 [saveProgress] Progress data:', progress)
      console.log('🔵 [saveProgress] Mark as completed:', markAsCompleted)

      const payload = {
        setsCompleted: progress.length,
        repsPerSet: progress.map((p) => p.reps),
        weight: progress[0]?.weight,
        rpe: progress[0]?.rpe,
        totalReps: progress[0]?.totalReps,  // For AMRAP/circuit
        roundsCompleted: progress[0]?.roundsCompleted,  // For circuit
        notes: exerciseNotes[currentExercise.id] || '',  // Notes for this exercise
        videos: progress.map((p) => p.videoUrl).filter(Boolean),
      }

      console.log('🔵 [saveProgress] Sending payload:', payload)

      // Use /save endpoint for draft save, /complete for marking as completed
      const endpoint = markAsCompleted ? 'complete' : 'save'
      const response = await fetch(
        `${API_URL}/workouts/${workoutId}/exercise/${currentExerciseIndex}/${endpoint}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      )

      console.log('🟡 [saveProgress] Response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('🔴 [saveProgress] Error response:', errorText)
        throw new Error(`Failed to save progress: ${response.status} ${errorText}`)
      }

      const result = await response.json()
      console.log('🟢 [saveProgress] SUCCESS:', result)
      
      // Verify the data was saved correctly by checking the response
      const savedExercise = result.sessionProgress?.exercises?.[currentExerciseIndex]
      if (savedExercise && savedExercise.data) {
        console.log('🟢 [saveProgress] Verification - Saved data:', savedExercise.data)
        
        // Build a detailed message showing what was saved
        const repsInfo = savedExercise.data.repsPerSet 
          ? `${progress.length} série${progress.length > 1 ? 's' : ''} (${savedExercise.data.repsPerSet.join(', ')} reps)`
          : 'données sauvegardées'
        
        const weightInfo = savedExercise.data.weightUsed ? ` - ${savedExercise.data.weightUsed} kg` : ''
        const notesInfo = savedExercise.data.notes ? ` - "${savedExercise.data.notes}"` : ''
        
        setSaveMessage(`✅ Sauvegarde réussie! ${repsInfo}${weightInfo}${notesInfo}`)
      } else {
        setSaveMessage('✅ Progression sauvegardée!')
      }
      
      // Keep message visible for 5 seconds
      const messageTimeout = setTimeout(() => setSaveMessage(''), 5000)
      
      // Update workout status
      if (result.status) {
        setWorkoutStatus(result.status)
        console.log('🟢 [saveProgress] Status updated to:', result.status)
      }
      
      // Auto-advance to next exercise if not last
      if (currentExerciseIndex < (session?.exercises?.length || 1) - 1) {
        setTimeout(() => setCurrentExerciseIndex(currentExerciseIndex + 1), 2000)
      }
      
      return messageTimeout
    } catch (err: any) {
      console.error('🔴 [saveProgress] ERROR:', err)
      setError('❌ Erreur: ' + (err.message || 'Impossible de sauvegarder'))
      setSaveMessage('')
    } finally {
      setSaving(false)
    }
  }

  const completeSession = async () => {
    try {
      setSaving(true)
      const response = await fetch(`${API_URL}/workouts/${workoutId}/end`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      })

      if (!response.ok) {
        throw new Error('Failed to complete session')
      }

      alert('Séance complétée ! 🎉')
      router.push('/dashboard/my-programs')
    } catch (err: any) {
      setError(err.message || 'Failed to complete session')
    } finally {
      setSaving(false)
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

  if (!session) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-red-600 text-lg">{error || 'Session not found'}</div>
        </main>
      </div>
    )
  }

  const currentExercise = session?.exercises?.[currentExerciseIndex]
  const progress = exerciseProgress[currentExercise?.id] || []

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <Sidebar />

      <main className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 sticky top-0 z-10">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold">💪 {session.title || 'Workout'}</h1>
                <p className="text-blue-100 mt-2">
                  {session.week.block.program.title} - Week {session.week.weekNumber}
                  {session.week.block.title && ` - ${session.week.block.title}`}
                </p>
                {session.date && (
                  <p className="text-blue-100 text-sm mt-1">
                    📅 {new Date(session.date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                )}
                <div className="mt-2 inline-block px-3 py-1 bg-blue-500 rounded-full text-sm font-semibold">
                  🔵 Statut: <span className="uppercase">{workoutStatus}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-blue-100">
                  Exercice {currentExerciseIndex + 1} sur {session?.exercises?.length || 0}
                </div>
                <div className="mt-2 text-2xl font-bold">
                  {Math.round(((currentExerciseIndex + 1) / (session?.exercises?.length || 1)) * 100)}%
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-blue-900 rounded-full h-2 overflow-hidden">
              <div
                className="bg-green-500 h-full transition-all duration-300"
                style={{ width: `${((currentExerciseIndex + 1) / (session?.exercises?.length || 1)) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div className="p-8 max-w-6xl mx-auto">
          {/* Session Overview - Show at Start or on Demand */}
          {currentExerciseIndex === 0 && (
            <div className="mb-8 bg-gradient-to-br from-indigo-900 to-purple-900 rounded-lg shadow-xl p-6 border-2 border-purple-500">
              <div className="flex items-start justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">📋 Aperçu de la séance</h2>
                <button
                  onClick={() => setCurrentExerciseIndex(0)}
                  className="px-3 py-1 text-xs bg-purple-700 hover:bg-purple-600 rounded-full text-white transition"
                >
                  Masquer
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {/* Total Exercises */}
                <div className="bg-gray-800 rounded-lg p-4 border border-purple-400">
                  <div className="text-sm text-gray-300">Nombre d'exercices</div>
                  <div className="text-3xl font-bold text-purple-400 mt-2">{session?.exercises?.length || 0}</div>
                </div>
                
                {/* Estimated Duration */}
                <div className="bg-gray-800 rounded-lg p-4 border border-blue-400">
                  <div className="text-sm text-gray-300">Durée estimée</div>
                  <div className="text-3xl font-bold text-blue-400 mt-2">
                    {Math.round((session?.exercises?.length || 5) * 6)}
                    <span className="text-lg ml-2">min</span>
                  </div>
                </div>
                
                {/* Total Series */}
                <div className="bg-gray-800 rounded-lg p-4 border border-green-400">
                  <div className="text-sm text-gray-300">Séries totales</div>
                  <div className="text-3xl font-bold text-green-400 mt-2">
                    {session?.exercises?.reduce((sum, ex) => sum + (ex.config?.sets || 0), 0) || 0}
                  </div>
                </div>
                
                {/* Difficulty */}
                <div className="bg-gray-800 rounded-lg p-4 border border-orange-400">
                  <div className="text-sm text-gray-300">Intensité</div>
                  <div className="text-3xl font-bold text-orange-400 mt-2">
                    {session?.exercises && session.exercises.length > 0
                      ? session.exercises.some(ex => (ex.config?.sets || 0) >= 4) 
                        ? 'Élevée 💪'
                        : session.exercises.some(ex => (ex.config?.sets || 0) >= 2)
                        ? 'Modérée 💪'
                        : 'Faible ✨'
                      : 'N/A'}
                  </div>
                </div>
              </div>
              
              {/* Session Notes */}
              {session.notes && (
                <div className="bg-gray-800 rounded-lg p-4 mb-4 border border-gray-600">
                  <div className="text-sm text-gray-300 mb-2">📝 Objectifs de la séance</div>
                  <p className="text-white">{session.notes}</p>
                </div>
              )}
              
              {/* Exercises List Preview */}
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-600">
                <div className="text-sm text-gray-300 mb-3">🏋️ Exercices à effectuer</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {session?.exercises?.slice(0, 6).map((ex, idx) => (
                    <div 
                      key={ex.id}
                      className="text-sm text-gray-200 flex items-center gap-2 p-2 bg-gray-700 rounded"
                    >
                      <span className="text-purple-400 font-bold">{idx + 1}.</span>
                      <span className="flex-1">{ex.exercise.name}</span>
                      {ex.config?.sets && (
                        <span className="text-xs bg-purple-900 px-2 py-1 rounded text-purple-200">
                          {ex.config.sets}×{ex.config.reps || '?'}
                        </span>
                      )}
                    </div>
                  ))}
                  {(session?.exercises?.length || 0) > 6 && (
                    <div className="text-xs text-gray-400 col-span-2 p-2 text-center">
                      ... et {(session?.exercises?.length || 0) - 6} autres exercices
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-indigo-900 rounded border border-indigo-500">
                <p className="text-sm text-indigo-200">
                  💡 <strong>Conseil:</strong> Commencez par l'échauffement si nécessaire. Bonne séance ! 🚀
                </p>
              </div>
            </div>
          )}

          {/* Success Notification - Save Message */}
          {saveMessage && (
            <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-top">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-4 rounded-lg shadow-2xl border-2 border-green-400 font-bold text-lg">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">✨</span>
                  <span>{saveMessage}</span>
                  <span className="text-2xl">✨</span>
                </div>
              </div>
            </div>
          )}

          {/* Error Notification */}
          {error && (
            <div className="fixed top-4 left-4 z-50 animate-in fade-in slide-in-from-top">
              <div className="bg-gradient-to-r from-red-500 to-rose-600 text-white px-6 py-4 rounded-lg shadow-2xl border-2 border-red-400 font-bold">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">⚠️</span>
                  <span>{error}</span>
                </div>
              </div>
            </div>
          )}

          {/* Current Exercise */}
          {currentExercise && (
            <div className="bg-gray-800 rounded-lg shadow-xl p-8 mb-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-white">{currentExercise.exercise.name}</h2>
                  {currentExercise.exercise.description && (
                    <p className="text-gray-400 mt-2">{currentExercise.exercise.description}</p>
                  )}
                </div>
              </div>

              {/* Config Info */}
              {currentExercise.config && (
                <div className="bg-gray-700 rounded-lg p-4 mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                  {currentExercise.config.sets && (
                    <div>
                      <div className="text-sm text-gray-300">Séries</div>
                      <div className="text-2xl font-bold text-green-400">{currentExercise.config.sets}</div>
                    </div>
                  )}
                  {currentExercise.config.reps && (
                    <div>
                      <div className="text-sm text-gray-300">Reps</div>
                      <div className="text-2xl font-bold text-blue-400">{currentExercise.config.reps}</div>
                    </div>
                  )}
                  {currentExercise.config.weight && (
                    <div>
                      <div className="text-sm text-gray-300">Poids</div>
                      <div className="text-2xl font-bold text-orange-400">{currentExercise.config.weight} kg</div>
                    </div>
                  )}
                  {currentExercise.config.format && (
                    <div>
                      <div className="text-sm text-gray-300">Format</div>
                      <div className="text-2xl font-bold text-purple-400">{currentExercise.config.format}</div>
                    </div>
                  )}
                </div>
              )}

              {/* Progress Input */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white">Votre progression :</h3>

                {progress.map((set, index) => (
                  <div key={index} className="bg-gray-700 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold">Série {index + 1}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => removeSet(currentExercise.id, index)}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900 rounded transition"
                          title="Supprimer cette série"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      {set.format !== 'AMRAP' && set.format !== 'circuit' && (
                        <>
                          <div>
                            <label className="text-sm text-gray-300">Reps</label>
                            <input
                              type="number"
                              min="0"
                              value={set.reps || ''}
                              onChange={(e) => updateExerciseProgress(currentExercise.id, index, 'reps', parseInt(e.target.value) || 0)}
                              className="w-full mt-1 px-3 py-2 bg-gray-600 rounded text-white border border-gray-500 focus:border-blue-500"
                              placeholder="Reps"
                            />
                          </div>
                          <div>
                            <label className="text-sm text-gray-300">Poids (kg)</label>
                            <input
                              type="number"
                              min="0"
                              step="0.5"
                              value={set.weight || ''}
                              onChange={(e) => updateExerciseProgress(currentExercise.id, index, 'weight', e.target.value ? parseFloat(e.target.value) : undefined)}
                              className="w-full mt-1 px-3 py-2 bg-gray-600 rounded text-white border border-gray-500 focus:border-blue-500"
                              placeholder="Poids"
                            />
                          </div>
                        </>
                      )}
                      
                      {(set.format === 'AMRAP' || set.format === 'circuit') && (
                        <>
                          <div>
                            <label className="text-sm text-gray-300">Total Reps</label>
                            <input
                              type="number"
                              min="0"
                              value={set.totalReps || ''}
                              onChange={(e) => updateExerciseProgress(currentExercise.id, index, 'totalReps', parseInt(e.target.value) || 0)}
                              className="w-full mt-1 px-3 py-2 bg-gray-600 rounded text-white border border-gray-500 focus:border-blue-500"
                              placeholder="Total Reps"
                            />
                          </div>
                        </>
                      )}
                      
                      {set.format === 'circuit' && (
                        <div>
                          <label className="text-sm text-gray-300">Rounds</label>
                          <input
                            type="number"
                            min="0"
                            value={set.roundsCompleted || ''}
                            onChange={(e) => updateExerciseProgress(currentExercise.id, index, 'roundsCompleted', parseInt(e.target.value) || 0)}
                            className="w-full mt-1 px-3 py-2 bg-gray-600 rounded text-white border border-gray-500 focus:border-blue-500"
                            placeholder="Rounds"
                          />
                        </div>
                      )}
                      
                      <div>
                        <label className="text-sm text-gray-300">RPE (1-10)</label>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={set.rpe || ''}
                          onChange={(e) => updateExerciseProgress(currentExercise.id, index, 'rpe', e.target.value ? parseInt(e.target.value) : undefined)}
                          className="w-full mt-1 px-3 py-2 bg-gray-600 rounded text-white border border-gray-500 focus:border-blue-500"
                          placeholder="RPE"
                        />
                      </div>
                    </div>

                    {/* Video Upload */}
                    <div className="border-t border-gray-600 pt-3 mt-3">
                      <label className="text-sm text-gray-300 block mb-2">Vidéo de cette série (optionnel)</label>
                      <VideoUploader 
                        onUploadSuccess={(url) => handleVideoUpload(currentExercise.id, index, url)}
                        progressId={`${currentExercise.id}-${index}`}
                      />
                      {set.videoUrl && (
                        <div className="mt-2 text-sm text-green-400 flex items-center gap-2">
                          <Check size={16} />
                          Vidéo uploadée
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                <button
                  onClick={() => addSet(currentExercise.id)}
                  className="w-full py-2 border-2 border-gray-600 text-gray-300 rounded-lg hover:border-green-500 hover:text-green-400 font-bold transition"
                >
                  + Ajouter une série
                </button>
              </div>

              {/* Notes per Exercise */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-bold text-white">📝 Notes sur cet exercice (compte rendu)</label>
                  {noteSaveStatus[currentExercise.id] && (
                    <span className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${
                      noteSaveStatus[currentExercise.id] === 'saving' ? 'bg-blue-600 text-blue-100' :
                      noteSaveStatus[currentExercise.id] === 'saved' ? 'bg-green-600 text-green-100' :
                      'bg-red-600 text-red-100'
                    }`}>
                      {noteSaveStatus[currentExercise.id] === 'saving' && (
                        <>
                          <span className="animate-spin">⚙️</span> Sauvegarde...
                        </>
                      )}
                      {noteSaveStatus[currentExercise.id] === 'saved' && (
                        <>
                          <Check size={14} /> Sauvegardé
                        </>
                      )}
                      {noteSaveStatus[currentExercise.id] === 'error' && (
                        <>
                          ⚠️ Erreur
                        </>
                      )}
                    </span>
                  )}
                </div>
                <textarea
                  value={exerciseNotes[currentExercise.id] || ''}
                  onChange={(e) => handleNoteChange(currentExercise.id, e.target.value)}
                  onBlur={() => handleNoteBlur(currentExercise.id)}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 h-24 resize-none"
                  placeholder="Décrivez votre expérience avec cet exercice, ce que vous avez ressenti, les difficultés rencontrées, etc."
                />
                <p className="text-xs text-gray-400 mt-2">💾 Auto-sauvegarde: 1s après votre dernier caractère ou en quittant le champ</p>
              </div>
            </div>
          )}

          {/* Navigation & Actions */}
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => setCurrentExerciseIndex(Math.max(0, currentExerciseIndex - 1))}
              disabled={currentExerciseIndex === 0}
              className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed font-bold"
            >
              ← Précédent
            </button>

            <button
              onClick={() => saveProgress(false)}
              disabled={isSaving}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-bold"
            >
              {isSaving ? 'Sauvegarde...' : '💾 Sauvegarder'}
            </button>

            {currentExerciseIndex < (session?.exercises?.length || 0) - 1 ? (
              <button
                onClick={() => setCurrentExerciseIndex(currentExerciseIndex + 1)}
                className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 font-bold"
              >
                Suivant →
              </button>
            ) : (
              <button
                onClick={completeSession}
                disabled={isSaving}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-bold flex items-center gap-2"
              >
                <Check size={20} />
                {isSaving ? 'Finalisation...' : 'Terminer la séance'}
              </button>
            )}
          </div>

          {/* All Exercises List */}
          <div className="bg-gray-800 rounded-lg shadow-xl p-6">
            <h3 className="text-2xl font-bold text-white mb-4">Exercices de la séance</h3>
            <div className="space-y-2">
              {session?.exercises?.map((ex, index) => (
                <div
                  key={ex.id}
                  onClick={() => toggleExerciseExpanded(index)}
                  className={`p-4 rounded-lg cursor-pointer transition ${
                    index === currentExerciseIndex
                      ? 'bg-blue-600'
                      : expandedExercises.includes(index)
                      ? 'bg-gray-700'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-lg">{index + 1}.</span>
                      <span className="font-semibold">{ex.exercise.name}</span>
                      {exerciseProgress[ex.id]?.some((p) => p.completed) && (
                        <Check size={20} className="text-green-400" />
                      )}
                    </div>
                    {expandedExercises.includes(index) ? <ChevronUp /> : <ChevronDown />}
                  </div>

                  {expandedExercises.includes(index) && (
                    <div className="mt-3 text-sm text-gray-300">
                      {ex.config && (
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {ex.config.sets && <div>📊 {ex.config.sets} séries</div>}
                          {ex.config.reps && <div>🔄 {ex.config.reps} reps</div>}
                          {ex.config.weight && <div>⚖️ {ex.config.weight} kg</div>}
                          {ex.config.format && <div>📋 {ex.config.format}</div>}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
