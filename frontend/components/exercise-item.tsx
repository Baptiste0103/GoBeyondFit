import Link from 'next/link'
import { useState } from 'react'

interface ExerciseItemProps {
  exerciseId?: string
  exerciseName?: string
  position?: number
  onView?: (exerciseId: string) => void
  isClickable?: boolean
}

export function ExerciseItem({ 
  exerciseId, 
  exerciseName = 'Unknown Exercise',
  position,
  onView,
  isClickable = true 
}: ExerciseItemProps) {
  const [loading, setLoading] = useState(false)

  if (!isClickable || !exerciseId) {
    return (
      <div className="bg-slate-700/50 px-3 py-2 rounded">
        <p className="text-slate-300 text-sm">
          {position && <span className="text-slate-500 mr-2">#{position}</span>}
          {exerciseName}
        </p>
      </div>
    )
  }

  return (
    <Link 
      href={`/dashboard/exercises/${exerciseId}`}
      className="group"
    >
      <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 hover:from-blue-600/40 hover:to-purple-600/40 px-3 py-2 rounded border border-blue-500/30 hover:border-blue-400/60 transition cursor-pointer">
        <div className="flex items-center justify-between">
          <p className="text-blue-300 group-hover:text-blue-200 text-sm font-medium">
            {position && <span className="text-slate-400 mr-2">#{position}</span>}
            {exerciseName}
          </p>
          <span className="text-blue-400 group-hover:text-blue-300 text-xs opacity-0 group-hover:opacity-100 transition">
            View →
          </span>
        </div>
      </div>
    </Link>
  )
}

export default ExerciseItem
