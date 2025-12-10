'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { authClient } from '@/lib/auth'
import { extractYouTubeId, getYouTubeThumbnail } from '@/lib/youtube-utils'

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

interface PaginationInfo {
  total: number
  page: number
  limit: number
  totalPages: number
}

interface SearchResponse {
  data: Exercise[]
  pagination: PaginationInfo
}

function ExerciseLibraryContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [pagination, setPagination] = useState<PaginationInfo | null>(null)

  // Search parameters
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [muscle, setMuscle] = useState(searchParams.get('muscle') || '')
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1'))

  useEffect(() => {
    if (!authClient.isAuthenticated()) {
      router.push('/auth/login')
      return
    }
    
    fetchExercises()
  }, [searchQuery, muscle, currentPage])

  const fetchExercises = async () => {
    try {
      setLoading(true)
      setError('')

      const token = authClient.getToken()
      if (!token) {
        router.push('/auth/login')
        return
      }

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
      })

      if (searchQuery) params.append('q', searchQuery)
      if (muscle) params.append('muscle', muscle)

      // Load all exercises (or at least a large batch) for filtering
      // We cache this to avoid repeated API calls when changing filters
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/exercises/library/search?page=1&limit=3500`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch exercises')
      }

      const data: SearchResponse = await response.json()
      
      // Filter exercises on client side
      let filteredExercises = data.data
      
      if (searchQuery && searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase()
        filteredExercises = filteredExercises.filter(ex => 
          ex.name.toLowerCase().includes(query) || 
          (ex.description && ex.description.toLowerCase().includes(query))
        )
      }
      
      if (muscle) {
        filteredExercises = filteredExercises.filter(ex => 
          (ex.meta?.targetMuscleGroup === muscle || ex.meta?.target_muscle_group === muscle)
        )
      }
      
      // Apply pagination on filtered results
      const pageSize = 20
      const totalFiltered = filteredExercises.length
      const totalPages = Math.ceil(totalFiltered / pageSize)
      const startIdx = (currentPage - 1) * pageSize
      const endIdx = startIdx + pageSize
      const paginatedExercises = filteredExercises.slice(startIdx, endIdx)
      
      setExercises(paginatedExercises)
      setPagination({
        total: totalFiltered,
        page: currentPage,
        limit: pageSize,
        totalPages: totalPages,
      })

      // Update URL with search params
      const newParams = new URLSearchParams()
      if (searchQuery) newParams.set('q', searchQuery)
      if (muscle) newParams.set('muscle', muscle)
      newParams.set('page', currentPage.toString())
      router.push(`?${newParams.toString()}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <Link href="/dashboard" className="text-blue-400 hover:text-blue-300 mb-6 inline-block text-lg font-semibold">
          ← Back to Dashboard
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">💪 Exercise Library</h1>
          <p className="text-slate-400">Browse and manage all available exercises</p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="bg-slate-800 rounded-lg p-6 mb-8 border border-slate-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <input
              type="text"
              placeholder="Search exercises..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="col-span-1 md:col-span-2 px-4 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
            />
            <select
              value={muscle}
              onChange={(e) => setMuscle(e.target.value)}
              className="px-4 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
            >
              <option value="">All Muscle Groups</option>
              <option value="Abdominals">Abdominals</option>
              <option value="Abductors">Abductors</option>
              <option value="Adductors">Adductors</option>
              <option value="Back">Back</option>
              <option value="Biceps">Biceps</option>
              <option value="Calves">Calves</option>
              <option value="Chest">Chest</option>
              <option value="Forearms">Forearms</option>
              <option value="Glutes">Glutes</option>
              <option value="Hamstrings">Hamstrings</option>
              <option value="Hip Flexors">Hip Flexors</option>
              <option value="Quadriceps">Quadriceps</option>
              <option value="Shins">Shins</option>
              <option value="Shoulders">Shoulders</option>
              <option value="Trapezius">Trapezius</option>
              <option value="Triceps">Triceps</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition"
          >
            Search
          </button>
        </form>

        {/* Results Info */}
        {pagination && (
          <div className="mb-4 text-slate-400 text-sm">
            Showing {((currentPage - 1) * pagination.limit) + 1} to {Math.min(currentPage * pagination.limit, pagination.total)} of {pagination.total} exercises
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/20 border border-red-700 text-red-300 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-slate-700 rounded-lg p-4 animate-pulse h-48"></div>
            ))}
          </div>
        )}

        {/* Exercises Grid */}
        {!loading && exercises.length === 0 ? (
          <div className="bg-slate-800 rounded-lg p-12 text-center border border-slate-700">
            <p className="text-slate-400 text-lg">No exercises found. Try adjusting your search criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {exercises.map((exercise) => {
              // Extract YouTube ID from video link
              const videoLink = exercise.meta?.explanation_link || exercise.meta?.indepth_explanation_link || exercise.meta?.inDepthExplanationLink
              const videoId = videoLink ? extractYouTubeId(videoLink) : null
              const thumbnailUrl = videoId ? getYouTubeThumbnail(videoId, 'hq') : null

              return (
                <div key={exercise.id} className="bg-slate-800 rounded-lg border border-slate-700 hover:border-blue-500 hover:bg-slate-700 transition h-full flex flex-col overflow-hidden">
                  {/* Video Thumbnail */}
                  {thumbnailUrl ? (
                    <Link href={`/dashboard/exercises/${exercise.id}`}>
                      <div className="relative w-full h-40 bg-slate-700 cursor-pointer overflow-hidden group">
                        <Image
                          src={thumbnailUrl}
                          alt={exercise.name}
                          fill
                          className="object-cover group-hover:opacity-90 transition"
                          onError={(e) => {
                            // Fallback to default YouTube thumbnail if maxres fails
                            if (videoId) {
                              e.currentTarget.src = getYouTubeThumbnail(videoId, 'default')
                            }
                          }}
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                        {/* Play button overlay - always visible */}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/50 transition">
                          <div className="bg-red-600 rounded-full p-3 shadow-lg group-hover:scale-110 transition">
                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        </div>
                        {/* Video indicator badge */}
                        <div className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded font-semibold">
                          🎥 VIDEO
                        </div>
                      </div>
                    </Link>
                  ) : (
                    <Link href={`/dashboard/exercises/${exercise.id}`}>
                      <div className="w-full h-40 bg-gradient-to-br from-blue-600 to-slate-700 flex items-center justify-center cursor-pointer group hover:from-blue-700 hover:to-slate-800 transition">
                        <div className="text-center">
                          <span className="text-5xl block mb-2">💪</span>
                          <span className="text-xs text-white font-semibold">No Video</span>
                        </div>
                      </div>
                    </Link>
                  )}

                  {/* Content */}
                  <div className="p-6 flex flex-col flex-1">
                    <Link href={`/dashboard/exercises/${exercise.id}`}>
                      <h3 className="text-lg font-semibold text-white mb-2 hover:text-blue-400 cursor-pointer">{exercise.name}</h3>
                    </Link>
                    
                    {exercise.description && (
                      <p className="text-slate-400 text-sm mb-3 line-clamp-2">{exercise.description}</p>
                    )}

                    {/* Meta Information - Muscle Group & Target */}
                    {exercise.meta && typeof exercise.meta === 'object' && (
                      <div className="mb-3 space-y-2 text-sm">
                        {(exercise.meta.targetMuscleGroup || exercise.meta.target_muscle_group) && (
                          <div className="inline-block bg-blue-600/20 text-blue-300 px-3 py-1 rounded text-xs font-semibold">
                            💪 {exercise.meta.targetMuscleGroup || exercise.meta.target_muscle_group}
                          </div>
                        )}
                        {(exercise.meta.difficulty_level || exercise.meta.difficultyLevel) && (
                          <div className="inline-block ml-2 bg-yellow-600/20 text-yellow-300 px-3 py-1 rounded text-xs font-semibold">
                            ⭐ {exercise.meta.difficulty_level || exercise.meta.difficultyLevel}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="mt-auto space-y-2">
                      {videoLink ? (
                        <a
                          href={videoLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-full text-center bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded transition"
                          onClick={(e) => e.stopPropagation()}
                        >
                          🎥 Watch Video
                        </a>
                      ) : (
                        <div className="block w-full text-center bg-slate-600 text-slate-400 py-2 px-4 rounded">
                          🎥 No video
                        </div>
                      )}

                      <Link href={`/dashboard/exercises/${exercise.id}`}>
                        <div className="w-full text-center text-blue-400 font-semibold text-sm hover:text-blue-300 cursor-pointer py-2">
                          View Details →
                        </div>
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && !loading && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-slate-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 transition"
            >
              ← Previous
            </button>
            
            {[...Array(Math.min(5, pagination.totalPages))].map((_, idx) => {
              const pageNum = Math.max(1, Math.min(currentPage - 2 + idx, pagination.totalPages - 4)) + idx
              if (pageNum > pagination.totalPages) return null
              
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-2 rounded transition ${
                    pageNum === currentPage
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {pageNum}
                </button>
              )
            })}

            <button
              onClick={() => setCurrentPage(Math.min(pagination.totalPages, currentPage + 1))}
              disabled={currentPage === pagination.totalPages}
              className="px-4 py-2 bg-slate-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 transition"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ExerciseLibraryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 flex items-center justify-center"><div className="text-white">Loading...</div></div>}>
      <ExerciseLibraryContent />
    </Suspense>
  )
}
