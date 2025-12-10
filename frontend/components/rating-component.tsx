'use client'

import { useState, useEffect } from 'react'
import { authClient } from '@/lib/auth'

interface Rating {
  id: string
  rating: number
  comment?: string
  createdAt: string
  user: {
    id: string
    pseudo: string
    firstName?: string
    lastName?: string
  }
}

interface RatingsData {
  totalRatings: number
  averageRating: number
  distribution: {
    5: number
    4: number
    3: number
    2: number
    1: number
  }
  userRating?: Rating | null
  recentRatings: Rating[]
}

interface RatingComponentProps {
  exerciseId: string
  onRatingUpdate?: () => void
}

export function RatingComponent({ exerciseId, onRatingUpdate }: RatingComponentProps) {
  const [ratingsData, setRatingsData] = useState<RatingsData | null>(null)
  const [userRating, setUserRating] = useState<number>(0)
  const [comment, setComment] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    fetchRatings()
  }, [exerciseId])

  const fetchRatings = async () => {
    try {
      setLoading(true)
      const token = authClient.getToken()
      if (!token) return

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/exercises/${exerciseId}/ratings`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      if (!response.ok) throw new Error('Failed to fetch ratings')

      const data = await response.json()
      setRatingsData(data)
      if (data.userRating) {
        setUserRating(data.userRating.rating)
        setComment(data.userRating.comment || '')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load ratings')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitRating = async () => {
    if (userRating === 0) {
      setError('Please select a rating')
      return
    }

    try {
      setSubmitting(true)
      setError('')
      const token = authClient.getToken()
      if (!token) return

      const method = ratingsData?.userRating ? 'PUT' : 'POST'
      const url = ratingsData?.userRating
        ? `${process.env.NEXT_PUBLIC_API_URL}/exercises/${exerciseId}/ratings/${ratingsData.userRating.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/exercises/${exerciseId}/ratings`

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating: userRating,
          comment: comment || undefined,
        }),
      })

      if (!response.ok) throw new Error('Failed to submit rating')

      setSuccess('Rating submitted successfully!')
      setTimeout(() => setSuccess(''), 3000)
      setShowForm(false)
      fetchRatings()
      onRatingUpdate?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit rating')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteRating = async () => {
    if (!ratingsData?.userRating) return

    try {
      setSubmitting(true)
      const token = authClient.getToken()
      if (!token) return

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/exercises/${exerciseId}/ratings/${ratingsData.userRating.id}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      if (!response.ok) throw new Error('Failed to delete rating')

      setSuccess('Rating deleted successfully!')
      setTimeout(() => setSuccess(''), 3000)
      setUserRating(0)
      setComment('')
      setShowForm(false)
      fetchRatings()
      onRatingUpdate?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete rating')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="bg-slate-700 rounded p-4 animate-pulse h-32"></div>
  }

  if (!ratingsData) {
    return <div className="text-slate-400">Failed to load ratings</div>
  }

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
      <h3 className="text-xl font-semibold text-white mb-4">⭐ Ratings & Reviews</h3>

      {/* Rating Summary */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="text-3xl font-bold text-yellow-400">
            {ratingsData.averageRating.toFixed(1)}
          </div>
          <div className="flex-1">
            <div className="flex gap-1">
              {[5, 4, 3, 2, 1].map((star) => (
                <span key={star} className={star <= Math.round(ratingsData.averageRating) ? '⭐' : '☆'}>
                </span>
              ))}
            </div>
            <p className="text-slate-400 text-sm">{ratingsData.totalRatings} ratings</p>
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = ratingsData.distribution[stars as keyof typeof ratingsData.distribution]
            const percentage = ratingsData.totalRatings > 0 
              ? (count / ratingsData.totalRatings) * 100 
              : 0
            return (
              <div key={stars} className="flex items-center gap-2">
                <span className="text-sm text-slate-400 w-12">{stars}⭐</span>
                <div className="flex-1 h-2 bg-slate-700 rounded">
                  <div
                    className="h-2 bg-yellow-400 rounded"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <span className="text-sm text-slate-400 w-8">{count}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Your Rating */}
      <div className="border-t border-slate-700 pt-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-semibold text-white">Your Rating</h4>
          {ratingsData.userRating && (
            <span className="text-yellow-400">⭐ {ratingsData.userRating.rating}</span>
          )}
        </div>

        {!showForm && ratingsData.userRating ? (
          <div className="bg-slate-700/50 p-4 rounded mb-4">
            <p className="text-slate-300">{ratingsData.userRating.comment}</p>
            <p className="text-xs text-slate-500 mt-2">
              {new Date(ratingsData.userRating.createdAt).toLocaleDateString()}
            </p>
          </div>
        ) : null}

        {!showForm ? (
          <button
            onClick={() => setShowForm(true)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition"
          >
            {ratingsData.userRating ? 'Edit Your Rating' : 'Add Your Rating'}
          </button>
        ) : (
          <div className="space-y-4">
            {/* Star Rating Input */}
            <div>
              <p className="text-slate-300 mb-2">Select Rating:</p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setUserRating(star)}
                    className={`text-3xl transition ${
                      star <= userRating ? 'text-yellow-400' : 'text-slate-500 hover:text-slate-400'
                    }`}
                  >
                    {star <= userRating ? '⭐' : '☆'}
                  </button>
                ))}
              </div>
            </div>

            {/* Comment Input */}
            <div>
              <label className="text-slate-300 block mb-2">Your Comment (Optional):</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your thoughts about this exercise..."
                className="w-full px-4 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-blue-500 focus:outline-none resize-none"
                rows={3}
              />
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="bg-red-900/20 border border-red-700 text-red-300 p-3 rounded text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-900/20 border border-green-700 text-green-300 p-3 rounded text-sm">
                {success}
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleSubmitRating}
                disabled={submitting || userRating === 0}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Rating'}
              </button>
              {ratingsData.userRating && (
                <button
                  onClick={handleDeleteRating}
                  disabled={submitting}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded transition disabled:opacity-50"
                >
                  {submitting ? 'Deleting...' : 'Delete'}
                </button>
              )}
              <button
                onClick={() => {
                  setShowForm(false)
                  setError('')
                  setSuccess('')
                }}
                disabled={submitting}
                className="bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-4 rounded transition disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Recent Ratings */}
      {ratingsData.recentRatings.length > 0 && (
        <div className="border-t border-slate-700 pt-6">
          <h4 className="font-semibold text-white mb-4">Recent Reviews</h4>
          <div className="space-y-4">
            {ratingsData.recentRatings.map((rating) => (
              <div key={rating.id} className="bg-slate-700/50 p-4 rounded">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-white font-semibold">
                      {rating.user.pseudo}
                    </p>
                    <p className="text-yellow-400">{'⭐'.repeat(rating.rating)}</p>
                  </div>
                  <p className="text-xs text-slate-500">
                    {new Date(rating.createdAt).toLocaleDateString()}
                  </p>
                </div>
                {rating.comment && (
                  <p className="text-slate-300 text-sm">{rating.comment}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
