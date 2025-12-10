'use client'

import React, { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, Loader2, Play, Clock, Zap } from 'lucide-react'
import { API_BASE_URL } from '@/lib/config'
import Link from 'next/link'

export interface CurrentSessionWidgetProps {
  onSessionFound?: (sessionId: string) => void
  onNoSession?: () => void
}

export function CurrentSessionWidget({ onSessionFound, onNoSession }: CurrentSessionWidgetProps) {
  const [session, setSession] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeElapsed, setTimeElapsed] = useState(0)

  useEffect(() => {
    const fetchCurrentSession = async () => {
      try {
        setIsLoading(true)
        const token = localStorage.getItem('token')

        if (!token) {
          setError('Not authenticated')
          setIsLoading(false)
          return
        }

        const response = await fetch(`${API_BASE_URL}/workouts/current`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error('Failed to fetch current session')
        }

        const data = await response.json()

        if (data.session) {
          setSession(data.session)
          if (onSessionFound) {
            onSessionFound(data.session.id)
          }
        } else {
          setSession(null)
          if (onNoSession) {
            onNoSession()
          }
        }

        setError(null)
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to load session'
        setError(errorMsg)
        console.error('Error fetching current session:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCurrentSession()
    const interval = setInterval(fetchCurrentSession, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [onSessionFound, onNoSession])

  // Update time elapsed
  useEffect(() => {
    if (!session || session.endedAt) return

    const interval = setInterval(() => {
      if (session?.startedAt) {
        const elapsed = Math.floor(
          (new Date().getTime() - new Date(session.startedAt).getTime()) / 1000
        )
        setTimeElapsed(elapsed)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [session])

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m ${secs}s`
  }

  const progressPercentage = session
    ? Math.round((session.exercisesCompleted / session.totalExercises) * 100)
    : 0

  // Loading state
  if (isLoading) {
    return (
      <Card className="p-6 bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="flex items-center justify-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <p className="text-slate-600">Loading session...</p>
        </div>
      </Card>
    )
  }

  // Error state
  if (error) {
    return (
      <Card className="p-6 bg-red-50 border border-red-200">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-red-900">Unable to Load Session</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </Card>
    )
  }

  // No active session state
  if (!session) {
    return (
      <Card className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 border-dashed">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-3 bg-slate-200 rounded-full">
              <Zap className="h-6 w-6 text-slate-600" />
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">No Active Workout</h3>
            <p className="text-sm text-slate-600 mt-1">
              Start a new workout session to get moving!
            </p>
          </div>
          <Link href="/workouts/start">
            <Button className="w-full bg-primary hover:bg-primary/90">
              <Play className="h-4 w-4 mr-2" />
              Start Workout
            </Button>
          </Link>
        </div>
      </Card>
    )
  }

  // Active session state
  return (
    <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 border-2">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Active Workout</h3>
            <p className="text-sm text-slate-600 mt-1">
              {session.exercisesCompleted} of {session.totalExercises} exercises completed
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 text-indigo-600 font-medium">
              <Clock className="h-4 w-4" />
              <span>{formatTime(timeElapsed)}</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-slate-600">
            <span>Progress</span>
            <span className="font-medium text-slate-900">{progressPercentage}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                progressPercentage === 100
                  ? 'bg-green-500'
                  : progressPercentage >= 75
                    ? 'bg-amber-500'
                    : 'bg-blue-500'
              }`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Session Stats */}
        <div className="grid grid-cols-3 gap-3 py-2 px-3 bg-white rounded-lg border border-slate-200">
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900">
              {session.exercisesCompleted}
            </p>
            <p className="text-xs text-slate-600 mt-0.5">Completed</p>
          </div>
          <div className="text-center border-l border-r border-slate-200">
            <p className="text-2xl font-bold text-slate-900">{session.totalExercises}</p>
            <p className="text-xs text-slate-600 mt-0.5">Total</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900">
              {session.totalExercises - session.exercisesCompleted}
            </p>
            <p className="text-xs text-slate-600 mt-0.5">Remaining</p>
          </div>
        </div>

        {/* Quick Info */}
        {session.restPeriodSeconds && (
          <div className="text-xs text-slate-600 bg-slate-100 p-2 rounded">
            <span className="font-medium">Rest period:</span> {session.restPeriodSeconds}s
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Link href={`/workouts/${session.id}/progress`} className="flex-1">
            <Button variant="outline" className="w-full">
              View Progress
            </Button>
          </Link>
          <Link href={`/workouts/${session.id}`} className="flex-1">
            <Button className="w-full bg-primary hover:bg-primary/90">
              <Play className="h-4 w-4 mr-2" />
              Continue
            </Button>
          </Link>
        </div>

        {/* Motivation */}
        {progressPercentage < 50 && (
          <div className="text-xs text-center text-slate-600 italic">
            💪 You&apos;re doing great! Keep it up!
          </div>
        )}
        {progressPercentage >= 50 && progressPercentage < 100 && (
          <div className="text-xs text-center text-slate-600 italic">
            🔥 Almost there! Push through!
          </div>
        )}
        {progressPercentage === 100 && (
          <div className="text-xs text-center text-green-600 italic font-medium">
            ✨ Workout complete! Time to finish!
          </div>
        )}
      </div>
    </Card>
  )
}
