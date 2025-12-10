'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Sidebar from '@/components/sidebar'
import { authClient } from '@/lib/auth'
import { exerciseClient, type Exercise } from '@/lib/api-client'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000'

interface SessionExercise {
  exerciseId: string
  position: number
  weight?: number
  reps?: number
  sets?: number
  format?: string
  duration?: number
  notes?: string
}

interface Session {
  title?: string
  exercises?: SessionExercise[]
}

interface Week {
  weekNumber: number
  sessions?: Session[]
}

interface Block {
  title?: string
  weeks?: Week[]
}

interface Program {
  id: string
  title: string
  description?: string
  isDraft: boolean
  blocks?: Block[]
}

export default function ProgramDetailPage() {
  const router = useRouter()
  const params = useParams()
  const programId = params.id as string

  const [program, setProgram] = useState<Program | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false)
  const [selectedSession, setSelectedSession] = useState<{ blockIndex: number; weekIndex: number; sessionIndex: number } | null>(null)
  const [selectedExercise, setSelectedExercise] = useState<string>('')
  const [exerciseData, setExerciseData] = useState({
    weight: '',
    reps: '',
    sets: '',
    format: '',
    duration: '',
    notes: '',
  })

  const token = authClient.getToken()

  useEffect(() => {
    const user = authClient.getUser()
    if (!user) {
      router.push('/auth/login')
      return
    }
    loadProgram()
    loadExercises()
  }, [programId, router])

  const loadProgram = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/programs/${programId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) throw new Error('Failed to load program')
      const data = await response.json()
      setProgram(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const loadExercises = async () => {
    try {
      const data = await exerciseClient.getAll()
      setExercises(data)
    } catch (err: any) {
      console.error('Failed to load exercises:', err.message)
    }
  }

  const handleSaveProgram = async () => {
    if (!program) return

    try {
      setSaving(true)
      const response = await fetch(`${API_URL}/programs/${programId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: program.title,
          description: program.description,
          isDraft: program.isDraft,
        }),
      })

      if (!response.ok) throw new Error('Failed to save program')
      alert('Program saved successfully!')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const addBlock = () => {
    if (!program) return
    const newBlock: Block = {
      title: `Block ${(program.blocks?.length || 0) + 1}`,
      weeks: [],
    }
    setProgram({
      ...program,
      blocks: [...(program.blocks || []), newBlock],
    })
  }

  const removeBlock = (index: number) => {
    if (!program) return
    setProgram({
      ...program,
      blocks: program.blocks?.filter((_, i) => i !== index),
    })
  }

  const updateBlock = (index: number, block: Block) => {
    if (!program) return
    const newBlocks = [...(program.blocks || [])]
    newBlocks[index] = block
    setProgram({
      ...program,
      blocks: newBlocks,
    })
  }

  const addWeekToBlock = (blockIndex: number) => {
    if (!program) return
    const block = program.blocks?.[blockIndex]
    if (!block) return

    const newWeek: Week = {
      weekNumber: (block.weeks?.length || 0) + 1,
      sessions: [],
    }
    const updatedBlock = {
      ...block,
      weeks: [...(block.weeks || []), newWeek],
    }
    updateBlock(blockIndex, updatedBlock)
  }

  const removeWeekFromBlock = (blockIndex: number, weekIndex: number) => {
    if (!program) return
    const block = program.blocks?.[blockIndex]
    if (!block) return

    const updatedBlock = {
      ...block,
      weeks: block.weeks?.filter((_, i) => i !== weekIndex),
    }
    updateBlock(blockIndex, updatedBlock)
  }

  const updateWeek = (blockIndex: number, weekIndex: number, week: Week) => {
    if (!program) return
    const block = program.blocks?.[blockIndex]
    if (!block) return

    const newWeeks = [...(block.weeks || [])]
    newWeeks[weekIndex] = week
    const updatedBlock = { ...block, weeks: newWeeks }
    updateBlock(blockIndex, updatedBlock)
  }

  const addSessionToWeek = (blockIndex: number, weekIndex: number) => {
    if (!program) return
    const block = program.blocks?.[blockIndex]
    const week = block?.weeks?.[weekIndex]
    if (!week) return

    const newSession: Session = {
      title: `Session ${(week.sessions?.length || 0) + 1}`,
      exercises: [],
    }
    const updatedWeek = {
      ...week,
      sessions: [...(week.sessions || []), newSession],
    }
    updateWeek(blockIndex, weekIndex, updatedWeek)
  }

  const openAddExerciseModal = (blockIndex: number, weekIndex: number, sessionIndex: number) => {
    setSelectedSession({ blockIndex, weekIndex, sessionIndex })
    setSelectedExercise('')
    setExerciseData({
      weight: '',
      reps: '',
      sets: '',
      format: '',
      duration: '',
      notes: '',
    })
    setShowAddExerciseModal(true)
  }

  const handleAddExerciseToSession = () => {
    if (!program || !selectedSession || !selectedExercise) {
      alert('Please select an exercise')
      return
    }

    const { blockIndex, weekIndex, sessionIndex } = selectedSession
    const block = program.blocks?.[blockIndex]
    const week = block?.weeks?.[weekIndex]
    const session = week?.sessions?.[sessionIndex]

    if (!session) return

    const newSessionExercise: SessionExercise = {
      exerciseId: selectedExercise,
      position: (session.exercises?.length || 0) + 1,
      weight: exerciseData.weight ? parseFloat(exerciseData.weight) : undefined,
      reps: exerciseData.reps ? parseInt(exerciseData.reps) : undefined,
      sets: exerciseData.sets ? parseInt(exerciseData.sets) : undefined,
      format: exerciseData.format || undefined,
      duration: exerciseData.duration ? parseInt(exerciseData.duration) : undefined,
      notes: exerciseData.notes || undefined,
    }

    const updatedSession = {
      ...session,
      exercises: [...(session.exercises || []), newSessionExercise],
    }

    const updatedWeek = {
      ...week,
      sessions: week.sessions?.map((s, i) => (i === sessionIndex ? updatedSession : s)),
    }

    updateWeek(blockIndex, weekIndex, updatedWeek)
    setShowAddExerciseModal(false)
  }

  const removeExerciseFromSession = (
    blockIndex: number,
    weekIndex: number,
    sessionIndex: number,
    exerciseIndex: number
  ) => {
    if (!program) return
    const block = program.blocks?.[blockIndex]
    const week = block?.weeks?.[weekIndex]
    const session = week?.sessions?.[sessionIndex]

    if (!session) return

    const updatedSession = {
      ...session,
      exercises: session.exercises?.filter((_, i) => i !== exerciseIndex),
    }

    const updatedWeek = {
      ...week,
      sessions: week.sessions?.map((s, i) => (i === sessionIndex ? updatedSession : s)),
    }

    updateWeek(blockIndex, weekIndex, updatedWeek)
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

  if (!program) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-red-600">Program not found</div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />

      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <button
                onClick={() => router.back()}
                className="text-blue-600 hover:text-blue-800 mb-4"
              >
                ← Back
              </button>
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{program.title}</h1>
                  <p className="text-gray-600 mt-1">{program.description}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveProgram}
                    disabled={saving}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                {error}
              </div>
            )}

            {/* Program Settings */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h2 className="text-lg font-semibold mb-4">Program Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <input
                    type="text"
                    value={program.title}
                    onChange={(e) => setProgram({ ...program, title: e.target.value })}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={program.description || ''}
                    onChange={(e) => setProgram({ ...program, description: e.target.value })}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={program.isDraft}
                      onChange={(e) => setProgram({ ...program, isDraft: e.target.checked })}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span className="ml-2 text-sm text-gray-700">Draft Status</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Blocks Editor */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Program Structure</h2>
                <button
                  onClick={addBlock}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                >
                  + Add Block
                </button>
              </div>

              <div className="space-y-6">
                {program.blocks && program.blocks.length > 0 ? (
                  program.blocks.map((block, blockIndex) => (
                    <div
                      key={blockIndex}
                      className="border border-gray-300 rounded-lg p-4 bg-gray-50"
                    >
                      {/* Block Header */}
                      <div className="flex justify-between items-center mb-4">
                        <input
                          type="text"
                          value={block.title || ''}
                          onChange={(e) =>
                            updateBlock(blockIndex, { ...block, title: e.target.value })
                          }
                          placeholder="Block title"
                          className="text-lg font-semibold px-2 py-1 border border-gray-300 rounded"
                        />
                        <button
                          onClick={() => removeBlock(blockIndex)}
                          className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                        >
                          Remove
                        </button>
                      </div>

                      {/* Weeks */}
                      <div className="ml-4 space-y-4">
                        <div className="flex justify-between items-center">
                          <h3 className="text-sm font-semibold text-gray-700">Weeks</h3>
                          <button
                            onClick={() => addWeekToBlock(blockIndex)}
                            className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                          >
                            + Add Week
                          </button>
                        </div>

                        {block.weeks && block.weeks.length > 0 ? (
                          <div className="space-y-3">
                            {block.weeks.map((week, weekIndex) => (
                              <div
                                key={weekIndex}
                                className="border border-gray-300 bg-white rounded p-3 ml-4"
                              >
                                <div className="flex justify-between items-center mb-2">
                                  <span className="font-medium text-sm text-gray-700">
                                    Week {week.weekNumber}
                                  </span>
                                  <button
                                    onClick={() =>
                                      removeWeekFromBlock(blockIndex, weekIndex)
                                    }
                                    className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                                  >
                                    Remove
                                  </button>
                                </div>

                                {/* Sessions */}
                                <div className="ml-2">
                                  <button
                                    onClick={() => addSessionToWeek(blockIndex, weekIndex)}
                                    className="px-2 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700 mb-2"
                                  >
                                    + Add Session
                                  </button>

                                  {week.sessions && week.sessions.length > 0 ? (
                                    <div className="space-y-2">
                                      {week.sessions.map((session, sessionIndex) => (
                                        <div
                                          key={sessionIndex}
                                          className="bg-purple-50 border border-purple-200 rounded p-2 text-sm"
                                        >
                                          <div className="flex justify-between items-center mb-2">
                                            <p className="text-purple-700 font-semibold">
                                              {session.title}
                                            </p>
                                            <button
                                              onClick={() =>
                                                openAddExerciseModal(
                                                  blockIndex,
                                                  weekIndex,
                                                  sessionIndex
                                                )
                                              }
                                              className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                                            >
                                              + Add Exercise
                                            </button>
                                          </div>
                                          {session.exercises && session.exercises.length > 0 ? (
                                            <div className="space-y-1 bg-white p-2 rounded">
                                              {session.exercises.map(
                                                (sessionExercise, exerciseIndex) => {
                                                  const exercise = exercises.find(
                                                    (e) => e.id === sessionExercise.exerciseId
                                                  )
                                                  return (
                                                    <div
                                                      key={exerciseIndex}
                                                      className="flex justify-between items-start bg-purple-100 p-2 rounded text-xs"
                                                    >
                                                      <div>
                                                        <p className="font-semibold">
                                                          {exercise?.name || 'Unknown Exercise'}
                                                        </p>
                                                        <div className="text-purple-700 space-y-0.5 mt-1">
                                                          {sessionExercise.sets && (
                                                            <p>Sets: {sessionExercise.sets}</p>
                                                          )}
                                                          {sessionExercise.reps && (
                                                            <p>Reps: {sessionExercise.reps}</p>
                                                          )}
                                                          {sessionExercise.weight && (
                                                            <p>
                                                              Weight: {sessionExercise.weight} kg
                                                            </p>
                                                          )}
                                                          {sessionExercise.format && (
                                                            <p>Format: {sessionExercise.format}</p>
                                                          )}
                                                          {sessionExercise.duration && (
                                                            <p>
                                                              Duration: {sessionExercise.duration} min
                                                            </p>
                                                          )}
                                                          {sessionExercise.notes && (
                                                            <p className="italic">
                                                              {sessionExercise.notes}
                                                            </p>
                                                          )}
                                                        </div>
                                                      </div>
                                                      <button
                                                        onClick={() =>
                                                          removeExerciseFromSession(
                                                            blockIndex,
                                                            weekIndex,
                                                            sessionIndex,
                                                            exerciseIndex
                                                          )
                                                        }
                                                        className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 flex-shrink-0 ml-2"
                                                      >
                                                        ✕
                                                      </button>
                                                    </div>
                                                  )
                                                }
                                              )}
                                            </div>
                                          ) : (
                                            <p className="text-xs text-gray-500 italic">
                                              No exercises in this session
                                            </p>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="text-xs text-gray-500 italic">No sessions yet</p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-500 italic">No weeks yet</p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">No blocks yet. Add one to get started!</p>
                )}
              </div>
            </div>

            {/* Save Button */}
            <div className="mt-8 flex gap-2">
              <button
                onClick={handleSaveProgram}
                disabled={saving}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Program'}
              </button>
              <button
                onClick={() => router.back()}
                className="px-6 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
              >
                Cancel
              </button>
            </div>

            {/* Add Exercise Modal */}
            {showAddExerciseModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
                  <h2 className="text-2xl font-bold mb-6">Add Exercise to Session</h2>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      handleAddExerciseToSession()
                    }}
                    className="space-y-4"
                  >
                    {/* Exercise Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Exercise *
                      </label>
                      <select
                        required
                        value={selectedExercise}
                        onChange={(e) => setSelectedExercise(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">-- Choose an exercise --</option>
                        {exercises.map((exercise) => (
                          <option key={exercise.id} value={exercise.id}>
                            {exercise.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Weight */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Weight (kg)
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        value={exerciseData.weight}
                        onChange={(e) =>
                          setExerciseData({ ...exerciseData, weight: e.target.value })
                        }
                        placeholder="e.g., 20.5"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Sets */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sets
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={exerciseData.sets}
                        onChange={(e) =>
                          setExerciseData({ ...exerciseData, sets: e.target.value })
                        }
                        placeholder="e.g., 3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Reps */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Reps
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={exerciseData.reps}
                        onChange={(e) =>
                          setExerciseData({ ...exerciseData, reps: e.target.value })
                        }
                        placeholder="e.g., 10"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Format */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Format
                      </label>
                      <select
                        value={exerciseData.format}
                        onChange={(e) =>
                          setExerciseData({ ...exerciseData, format: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">-- Choose format --</option>
                        <option value="standard">Standard</option>
                        <option value="EMOM">EMOM (Every Minute On Minute)</option>
                        <option value="AMRAP">AMRAP (As Many Reps As Possible)</option>
                        <option value="for-time">For Time</option>
                        <option value="circuit">Circuit</option>
                      </select>
                    </div>

                    {/* Duration */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Duration (minutes)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={exerciseData.duration}
                        onChange={(e) =>
                          setExerciseData({ ...exerciseData, duration: e.target.value })
                        }
                        placeholder="e.g., 10"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Notes
                      </label>
                      <textarea
                        value={exerciseData.notes}
                        onChange={(e) =>
                          setExerciseData({ ...exerciseData, notes: e.target.value })
                        }
                        placeholder="e.g., Focus on form, rest 30s between sets..."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-2 pt-4">
                      <button
                        type="submit"
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                      >
                        Add Exercise
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddExerciseModal(false)}
                        className="flex-1 px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
