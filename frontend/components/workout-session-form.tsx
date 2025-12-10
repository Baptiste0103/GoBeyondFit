/* @ts-nocheck */
'use client'
import React, { useState, useEffect } from 'react'
import { useForm, Controller, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { AlertCircle, CheckCircle, Loader2, Plus, X } from 'lucide-react'
import { VideoUploader } from './video-uploader'
import { API_BASE_URL } from '@/lib/config'

// Zod Schemas for each exercise type
const StandardProgressSchema = z.object({
  setsCompleted: z.number().min(1, 'Sets must be at least 1'),
  repsCompleted: z.number().min(1, 'Reps must be at least 1'),
  weightUsed: z.number().optional(),
  weightUnit: z.string().optional().default('lbs'),
  rpe: z.number().min(1).max(10),
  notes: z.string().optional(),
})

const EMOMProgressSchema = z.object({
  repsPerMinute: z.array(z.number().min(0)).min(1, 'Must have at least one minute'),
  rpe: z.number().min(1).max(10),
  notes: z.string().optional(),
})

const AMRAPProgressSchema = z.object({
  totalReps: z.number().min(1, 'Total reps must be at least 1'),
  rpe: z.number().min(1).max(10),
  notes: z.string().optional(),
})

const CircuitProgressSchema = z.object({
  roundsCompleted: z.number().min(1, 'Rounds must be at least 1'),
  totalReps: z.number().min(1, 'Total reps must be at least 1'),
  weightUsed: z.number().optional(),
  weightUnit: z.string().optional().default('lbs'),
  rpe: z.number().min(1).max(10),
  notes: z.string().optional(),
})

// Main discriminated union schema
const ExerciseProgressSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('standard'),
    setsCompleted: z.number().min(1, 'Sets must be at least 1'),
    repsCompleted: z.number().min(1, 'Reps must be at least 1'),
    weightUsed: z.number().optional(),
    weightUnit: z.string().optional(),
    rpe: z.number().min(1).max(10),
    notes: z.string().optional(),
  }),
  z.object({
    type: z.literal('EMOM'),
    repsPerMinute: z.array(z.number().min(0)).min(1, 'Must have at least one minute'),
    rpe: z.number().min(1).max(10),
    notes: z.string().optional(),
  }),
  z.object({
    type: z.literal('AMRAP'),
    totalReps: z.number().min(1, 'Total reps must be at least 1'),
    rpe: z.number().min(1).max(10),
    notes: z.string().optional(),
  }),
  z.object({
    type: z.literal('circuit'),
    roundsCompleted: z.number().min(1, 'Rounds must be at least 1'),
    totalReps: z.number().min(1, 'Total reps must be at least 1'),
    weightUsed: z.number().optional(),
    weightUnit: z.string().optional(),
    rpe: z.number().min(1).max(10),
    notes: z.string().optional(),
  }),
])

type ExerciseProgress = z.infer<typeof ExerciseProgressSchema>

export interface WorkoutSessionFormProps {
  workoutId: string
  exerciseIndex: number
  config: {
    type: 'standard' | 'EMOM' | 'AMRAP' | 'circuit'
    exerciseName: string
    sets?: number
    reps?: number
    totalMinutes?: number
    repsPerMinute?: number
    timeMinutes?: number
    targetReps?: number
    rounds?: number
    weight?: number
    restSeconds?: number
    notes?: string
  }
  progressId: string
  onSuccess?: (data: any) => void
  onError?: (error: string) => void
}

export function WorkoutSessionForm({
  workoutId,
  exerciseIndex,
  config,
  progressId,
  onSuccess,
  onError,
}: WorkoutSessionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [videoMediaId, setVideoMediaId] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null)

  // Initialize form with correct type
  // @ts-ignore - exercise progress schema has dynamic types
  const form = useForm<ExerciseProgress>({
    resolver: zodResolver(ExerciseProgressSchema),
    defaultValues: {
      type: config.type as any,
      rpe: 5,
      ...(config.type === 'standard' && {
        setsCompleted: 1,
        repsCompleted: 1,
        weightUnit: 'lbs',
      }),
      ...(config.type === 'EMOM' && {
        repsPerMinute: Array(config.totalMinutes || 5).fill(0),
      }),
      ...(config.type === 'AMRAP' && {
        totalReps: 0,
      }),
      ...(config.type === 'circuit' && {
        roundsCompleted: 1,
        totalReps: 0,
        weightUnit: 'lbs',
      }),
    },
  })

  // Field array for EMOM - disabled for now as it causes type issues
  // const { fields: emomFields, append: appendEMOM } = useFieldArray({
  //   control: form.control,
  //   name: config.type === 'EMOM' ? 'repsPerMinute' : 'notes',
  // })

  const onSubmit = async (data: ExerciseProgress) => {
    setIsSubmitting(true)
    setSubmitError(null)
    setSubmitSuccess(null)

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Authentication token not found')
      }

      const response = await fetch(
        `${API_BASE_URL}/workouts/${workoutId}/exercise/${exerciseIndex}/complete`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...data,
            videoMediaId: videoMediaId || undefined,
            durationSeconds: 0, // Would be calculated from video if available
          }),
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          errorData.message || `Failed to save: ${response.status} ${response.statusText}`
        )
      }

      const result = await response.json()
      setSubmitSuccess('Exercise progress saved successfully!')

      if (onSuccess) {
        onSuccess(result)
      }

      // Reset form after success
      setTimeout(() => {
        form.reset()
        setVideoMediaId(null)
      }, 1500)
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to save exercise'
      setSubmitError(errorMsg)

      if (onError) {
        onError(errorMsg)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const exerciseType = form.watch('type')

  return (
    <div className="space-y-6">
      {/* Exercise Header */}
      <Card className="p-4 bg-gradient-to-r from-slate-100 to-slate-50 border-slate-200">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{config.exerciseName}</h3>
            <p className="text-sm text-slate-600 capitalize mt-1">
              Exercise Type: <span className="font-medium">{config.type}</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500">Exercise #{exerciseIndex + 1}</p>
          </div>
        </div>

        {/* Coach Config Preview */}
        <div className="mt-4 p-3 bg-white rounded border border-slate-200">
          <p className="text-xs font-medium text-slate-700 mb-2">Coach Configuration:</p>
          <div className="text-xs text-slate-600 space-y-1">
            {config.type === 'standard' && (
              <>
                <p>• Target: {config.sets} sets × {config.reps} reps</p>
                {config.weight && <p>• Weight: {config.weight} {config.weight} lbs</p>}
              </>
            )}
            {config.type === 'EMOM' && (
              <>
                <p>• Duration: {config.totalMinutes} minutes</p>
                <p>• Target: {config.repsPerMinute} reps/minute</p>
              </>
            )}
            {config.type === 'AMRAP' && (
              <>
                <p>• Duration: {config.timeMinutes} minutes</p>
                <p>• Target: {config.targetReps} reps</p>
              </>
            )}
            {config.type === 'circuit' && (
              <>
                <p>• Rounds: {config.rounds}</p>
                <p>• Reps/round: {config.repsPerMinute}</p>
                {config.weight && <p>• Weight: {config.weight} lbs</p>}
                {config.restSeconds && <p>• Rest: {config.restSeconds}s between rounds</p>}
              </>
            )}
            {config.notes && <p>• Notes: {config.notes}</p>}
          </div>
        </div>
      </Card>

      {/* Error Display */}
      {submitError && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{submitError}</p>
        </div>
      )}

      {/* Success Display */}
      {submitSuccess && (
        <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-800">{submitSuccess}</p>
        </div>
      )}

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Exercise Type Specific Fields */}
          {exerciseType === 'standard' && (
            <div className="space-y-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <h4 className="font-medium text-slate-900">Your Performance</h4>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="setsCompleted"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sets Completed</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="repsCompleted"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reps per Set</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="weightUsed"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weight Used (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.5"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="weightUnit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="lbs">lbs</option>
                          <option value="kg">kg</option>
                        </select>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="How did it feel? Any modifications?" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {exerciseType === 'EMOM' && (
            <div className="space-y-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <h4 className="font-medium text-slate-900">Reps per Minute</h4>

              <FormField
                control={form.control as any}
                name="repsPerMinute"
                render={({ field }: any) => (
                  <FormItem>
                    <FormLabel>Enter reps for each minute</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., 5,5,5,5,5 (comma-separated)"
                        {...field}
                        value={Array.isArray(field.value) ? field.value.join(',') : ''}
                        onChange={(e: any) => {
                          const values = e.target.value.split(',').map((v: string) => parseInt(v.trim()) || 0)
                          field.onChange(values)
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as any}
                name="notes"
                render={({ field }: any) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="How did the pacing feel? Any missed reps?"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {exerciseType === 'AMRAP' && (
            <div className="space-y-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <h4 className="font-medium text-slate-900">Your Performance</h4>

              <FormField
                control={form.control}
                name="totalReps"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Reps Completed</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>How many reps in {config.timeMinutes} minutes?</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Which movement was the limiting factor? How did you pace it?"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {exerciseType === 'circuit' && (
            <div className="space-y-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <h4 className="font-medium text-slate-900">Your Performance</h4>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="roundsCompleted"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rounds Completed</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="totalReps"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Reps</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="weightUsed"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weight Used (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.5"
                          {...field}
                          onChange={(e) =>
                            field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="weightUnit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="lbs">lbs</option>
                          <option value="kg">kg</option>
                        </select>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="How was the flow? Any movements that slowed you down?"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* RPE Scale - Common to all types */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 space-y-4">
            <FormField
              control={form.control}
              name="rpe"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rate of Perceived Exertion (RPE)</FormLabel>
                  <FormDescription>
                    1 = Very easy | 5 = Moderate | 10 = Maximum effort
                  </FormDescription>
                  <FormControl>
                    <div className="space-y-3">
                      <Slider
                        min={1}
                        max={10}
                        step={1}
                        value={String(field.value)}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => field.onChange(Number(e.target.value))}
                        className="w-full"
                      />
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Easy</span>
                        <span className="text-lg font-bold text-blue-600">{field.value}/10</span>
                        <span className="text-sm text-slate-600">Hard</span>
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Video Upload */}
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <h4 className="font-medium text-slate-900 mb-4">Upload Evidence (Optional)</h4>
            <VideoUploader
              progressId={progressId}
              onUploadSuccess={(mediaId) => {
                setVideoMediaId(mediaId)
              }}
              onUploadError={(error) => {
                console.error('Video upload error:', error)
              }}
              disabled={isSubmitting}
            />
            {videoMediaId && (
              <div className="mt-3 flex items-center gap-2 text-sm text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span>Video uploaded successfully</span>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary hover:bg-primary/90 h-11 text-base"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Exercise Progress'
            )}
          </Button>
        </form>
      </Form>
    </div>
  )
}
