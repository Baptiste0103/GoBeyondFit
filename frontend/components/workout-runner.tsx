'use client';

import { useState, useEffect } from 'react';
import { Play, Pause, Check, SkipForward, Square, Loader2 } from 'lucide-react';
import { authClient } from '@/lib/auth';

interface WorkoutExercise {
  exerciseId: string;
  name: string;
  sets?: number;
  reps?: number;
  duration?: number;
  rest?: number;
  videoUrl?: string;
}

interface WorkoutSession {
  sessionId: string;
  exercises: WorkoutExercise[];
  restPeriod: number;
}

export default function WorkoutRunnerComponent({ sessionId }: { sessionId: string }) {
  const [workout, setWorkout] = useState<any>(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [restTime, setRestTime] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [workoutId, setWorkoutId] = useState<string | null>(null);
  const token = authClient.getToken();

  const startWorkout = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/workouts/start/${sessionId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          restPeriodSeconds: 60,
          formGuidanceEnabled: true,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setWorkoutId(data.workoutId);
        setIsRunning(true);
      }
    } catch (error) {
      console.error('Error starting workout:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const completeExercise = async () => {
    if (!workoutId) return;

    try {
      const response = await fetch(
        `/api/workouts/${workoutId}/exercise/${currentExerciseIndex}/complete`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            setsCompleted: workout?.exercises[currentExerciseIndex]?.sets || 3,
            formRating: 4,
          }),
        }
      );

      if (response.ok) {
        if (currentExerciseIndex < (workout?.exercises.length || 0) - 1) {
          setCurrentExerciseIndex(currentExerciseIndex + 1);
          setRestTime(workout?.restPeriod || 60);
        } else {
          endWorkout();
        }
      }
    } catch (error) {
      console.error('Error completing exercise:', error);
    }
  };

  const skipExercise = async () => {
    if (!workoutId) return;

    try {
      await fetch(`/api/workouts/${workoutId}/exercise/${currentExerciseIndex}/skip`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason: 'User skipped' }),
      });

      if (currentExerciseIndex < (workout?.exercises.length || 0) - 1) {
        setCurrentExerciseIndex(currentExerciseIndex + 1);
      }
    } catch (error) {
      console.error('Error skipping exercise:', error);
    }
  };

  const endWorkout = async () => {
    if (!workoutId) return;

    try {
      await fetch(`/api/workouts/${workoutId}/end`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setIsRunning(false);
    } catch (error) {
      console.error('Error ending workout:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  if (!isRunning) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-6">
        <h2 className="text-2xl font-bold">Ready to Start?</h2>
        <button
          onClick={startWorkout}
          className="flex items-center gap-2 px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 text-lg font-semibold"
        >
          <Play size={24} />
          Start Workout
        </button>
      </div>
    );
  }

  const currentExercise = workout?.exercises[currentExerciseIndex];
  const progress = Math.round(((currentExerciseIndex + 1) / (workout?.exercises.length || 1)) * 100);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          <span className="font-semibold">
            Exercise {currentExerciseIndex + 1} of {workout?.exercises.length || 0}
          </span>
          <span className="font-semibold">{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <div
            className="bg-blue-600 h-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Current Exercise */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
        <h2 className="text-4xl font-bold mb-4">{currentExercise?.name}</h2>

        {currentExercise?.videoUrl && (
          <div className="mb-6 aspect-video bg-gray-200 rounded-lg overflow-hidden">
            <video src={currentExercise.videoUrl} controls className="w-full h-full object-cover" />
          </div>
        )}

        <div className="grid grid-cols-3 gap-4 mb-8 text-center">
          {currentExercise?.sets && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Sets</p>
              <p className="text-3xl font-bold text-blue-600">{currentExercise.sets}</p>
            </div>
          )}

          {currentExercise?.reps && (
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Reps</p>
              <p className="text-3xl font-bold text-green-600">{currentExercise.reps}</p>
            </div>
          )}

          {currentExercise?.duration && (
            <div className="p-4 bg-orange-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Duration</p>
              <p className="text-3xl font-bold text-orange-600">{currentExercise.duration}s</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={completeExercise}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
          >
            <Check size={20} />
            Complete Exercise
          </button>

          <button
            onClick={skipExercise}
            className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-semibold"
          >
            <SkipForward size={20} />
            Skip
          </button>

          <button
            onClick={endWorkout}
            className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold"
          >
            <Square size={20} />
            End Workout
          </button>
        </div>
      </div>
    </div>
  );
}
