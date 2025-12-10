'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { authClient } from '@/lib/auth'
import { RatingComponent } from '@/components/rating-component'
import FavoriteButton from '@/components/favorite-button'

interface ExerciseMeta {
  exercise?: string
  shortDemonstration?: string
  inDepthExplanation?: string
  shortDemonstrationLink?: string
  inDepthExplanationLink?: string
  targetMuscleGroup?: string
  [key: string]: any
}

interface Exercise {
  id: string
  name: string
  description?: string
  scope: 'global' | 'personal'
  meta?: ExerciseMeta
  owner?: {
    id: string
    pseudo: string
    firstName: string
    lastName: string
  }
  createdAt: string
}

export default function ExerciseDetailPage() {
  const router = useRouter()
  const params = useParams()
  const exerciseId = params.id as string

  const [exercise, setExercise] = useState<Exercise | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!authClient.isAuthenticated()) {
      router.push('/auth/login')
      return
    }

    fetchExerciseDetail()
  }, [exerciseId])

  const fetchExerciseDetail = async () => {
    try {
      setLoading(true)
      setError('')

      const token = authClient.getToken()
      if (!token) {
        router.push('/auth/login')
        return
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/exercises/${exerciseId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Exercise not found')
        }
        throw new Error('Failed to fetch exercise details')
      }

      const data = await response.json()
      setExercise(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const extractYouTubeId = (url?: string): string | null => {
    if (!url) return null

    // Handle youtu.be/ID format (with or without params)
    const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/)
    if (shortMatch) return shortMatch[1]

    // Handle youtube.com/watch?v=ID format
    const longMatch = url.match(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/)
    if (longMatch) return longMatch[1]

    // Handle youtube.com/embed/ID format
    const embedMatch = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]+)/)
    if (embedMatch) return embedMatch[1]

    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-slate-700 rounded w-1/2"></div>
            <div className="h-40 bg-slate-700 rounded"></div>
            <div className="h-32 bg-slate-700 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !exercise) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
        <div className="max-w-4xl mx-auto">
          <Link href="/dashboard/exercises/library" className="text-blue-400 hover:text-blue-300 mb-6 inline-block">
            ← Back to Library
          </Link>
          <div className="bg-red-900/20 border border-red-700 text-red-300 px-6 py-4 rounded">
            <p className="text-lg font-semibold mb-2">Error</p>
            <p>{error || 'Exercise not found'}</p>
          </div>
        </div>
      </div>
    )
  }

  const inDepthVideoId = extractYouTubeId(exercise.meta?.inDepthExplanationLink || exercise.meta?.indepth_explanation_link || exercise.meta?.explanation_link)
  const shortVideoId = extractYouTubeId(exercise.meta?.shortDemonstrationLink || exercise.meta?.short_demonstration_link)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link href="/dashboard/exercises/library" className="text-blue-400 hover:text-blue-300 mb-6 inline-block">
          ← Back to Library
        </Link>

        {/* Header */}
        <div className="bg-slate-800 rounded-lg p-8 border border-slate-700 mb-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between md:gap-4 mb-4">
            <h1 className="text-4xl font-bold text-white mb-4 md:mb-0 flex-1">{exercise.name}</h1>
            <FavoriteButton exerciseId={exercise.id} />
          </div>

          <div className="flex flex-wrap gap-4 mb-6">
            {exercise.meta?.targetMuscleGroup && (
              <div className="bg-blue-600/20 text-blue-300 px-4 py-2 rounded">
                💪 <span className="font-semibold">{exercise.meta.targetMuscleGroup}</span>
              </div>
            )}

            {exercise.scope === 'personal' && exercise.owner && (
              <div className="bg-slate-700 text-slate-300 px-4 py-2 rounded">
                👤 <span className="font-semibold">{exercise.owner.pseudo}</span>
              </div>
            )}
          </div>

          {exercise.description && (
            <p className="text-slate-300 text-lg">{exercise.description}</p>
          )}
        </div>

        {/* Videos Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* In-Depth Video */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-2xl font-semibold text-white mb-4">📹 Full Demonstration</h2>

            {inDepthVideoId ? (
              <div className="space-y-4">
                <div className="aspect-video bg-black rounded-lg overflow-hidden">
                  <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${inDepthVideoId}`}
                    title={`${exercise.name} - Full Demonstration`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  ></iframe>
                </div>
                <a
                  href={exercise.meta?.inDepthExplanationLink || exercise.meta?.indepth_explanation_link || exercise.meta?.explanation_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded transition"
                >
                  🎥 Watch on YouTube
                </a>
              </div>
            ) : (
              <div className="bg-slate-700 text-slate-400 px-6 py-8 rounded-lg text-center">
                Video not available
              </div>
            )}
          </div>

          {/* Short Demo Video */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-2xl font-semibold text-white mb-4">⏱️ Quick Demo</h2>

            {shortVideoId ? (
              <div className="space-y-4">
                <div className="aspect-video bg-black rounded-lg overflow-hidden">
                  <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${shortVideoId}`}
                    title={`${exercise.name} - Quick Demo`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  ></iframe>
                </div>
                <a
                  href={exercise.meta?.shortDemonstrationLink || exercise.meta?.short_demonstration_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded transition"
                >
                  ⏱️ Watch Quick Demo
                </a>
              </div>
            ) : (
              <div className="bg-slate-700 text-slate-400 px-6 py-8 rounded-lg text-center">
                Quick demo not available
              </div>
            )}
          </div>
        </div>

        {/* Detailed Info */}
        {exercise.meta && (
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-2xl font-semibold text-white mb-4">📋 Exercise Details</h2>

            <div className="space-y-3 text-slate-300">
              {exercise.meta.exercise && (
                <div>
                  <span className="font-semibold text-white">Exercise:</span> {exercise.meta.exercise}
                </div>
              )}

              {exercise.meta.shortDemonstration && (
                <div>
                  <span className="font-semibold text-white">Short Demo:</span> {exercise.meta.shortDemonstration}
                </div>
              )}

              {exercise.meta.inDepthExplanation && (
                <div>
                  <span className="font-semibold text-white">In-Depth Explanation:</span> {exercise.meta.inDepthExplanation}
                </div>
              )}

              {exercise.meta.targetMuscleGroup && (
                <div>
                  <span className="font-semibold text-white">Target Muscle:</span> {exercise.meta.targetMuscleGroup}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Ratings Component */}
        <RatingComponent exerciseId={exercise.id} />
      </div>
    </div>
  )
}
