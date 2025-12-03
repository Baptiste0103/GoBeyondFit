import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class WorkoutRunnerService {
  constructor(private prisma: PrismaService) {}

  /**
   * Start a workout session
   */
  async startWorkout(
    userId: string,
    sessionId: string,
    config: {
      restPeriodSeconds?: number;
      formGuidanceEnabled?: boolean;
    } = {}
  ) {
    // Verify session exists
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
    })

    if (!session) {
      throw new NotFoundException('Session not found')
    }

    // Get exercises in session
    const sessionData = (session as any).data || {}
    const totalExercises = sessionData.exercises?.length || 0

    // Create workout record
    const workout = await this.prisma.workoutSession.create({
      data: {
        userId,
        startedAt: new Date(),
        startTime: new Date(),
        exercisesCompleted: 0,
        totalExercises,
        restPeriodSeconds: config.restPeriodSeconds || 60,
        formGuidanceEnabled: config.formGuidanceEnabled ?? true,
      },
    })

    return {
      workoutId: workout.id,
      sessionId,
      totalExercises,
      restPeriod: workout.restPeriodSeconds,
      formGuidance: workout.formGuidanceEnabled,
      startedAt: workout.startedAt,
    }
  }

  /**
   * Complete an exercise in workout
   */
  async completeExercise(
    userId: string,
    workoutId: string,
    exerciseIndex: number,
    data: {
      setsCompleted: number;
      repsPerSet?: number[];
      weight?: number;
      duration?: number;
      notes?: string;
      formRating?: number;
    }
  ) {
    const workout = await this.prisma.workoutSession.findUnique({
      where: { id: workoutId },
    })

    if (!workout) {
      throw new NotFoundException('Workout not found')
    }

    if (workout.userId !== userId) {
      throw new BadRequestException('Unauthorized')
    }

    // Log exercise completion
    const exerciseLog = await this.prisma.exerciseLog.create({
      data: {
        sessionId: workoutId,
        exerciseId: 'placeholder-exercise-id',
        userId,
        setsCompleted: data.setsCompleted,
        weight: data.weight,
        duration: data.duration,
        notes: data.notes,
        formRating: data.formRating,
        completedAt: new Date(),
      },
    })

    // Update workout progress
    const updatedWorkout = await this.prisma.workoutSession.update({
      where: { id: workoutId },
      data: {
        exercisesCompleted: (workout.exercisesCompleted || 0) + 1,
      },
    })

    const completed = updatedWorkout.exercisesCompleted || 0
    const total = updatedWorkout.totalExercises || 1

    return {
      exerciseLogId: exerciseLog.id,
      progress: {
        completed,
        total,
        percentage: Math.round((completed / total) * 100),
      },
    }
  }

  /**
   * End workout session
   */
  async endWorkout(userId: string, workoutId: string) {
    const workout = await this.prisma.workoutSession.findUnique({
      where: { id: workoutId },
    })

    if (!workout) {
      throw new NotFoundException('Workout not found')
    }

    if (workout.userId !== userId) {
      throw new BadRequestException('Unauthorized')
    }

    const endTime = new Date()
    const startTime = workout.startTime || workout.startedAt
    const duration = (endTime.getTime() - (startTime?.getTime() || 0)) / 1000 / 60 // in minutes

    const updatedWorkout = await this.prisma.workoutSession.update({
      where: { id: workoutId },
      data: {
        endedAt: endTime,
        endTime: endTime,
        duration: Math.round(duration * 60),
      },
    })

    const completed = updatedWorkout.exercisesCompleted || 0
    const total = updatedWorkout.totalExercises || 1

    return {
      workoutId: updatedWorkout.id,
      completedAt: updatedWorkout.endedAt,
      duration: Math.round(duration),
      exercisesCompleted: completed,
      totalExercises: total,
      completionRate: Math.round((completed / total) * 100),
    }
  }

  /**
   * Get workout progress
   */
  async getWorkoutProgress(userId: string, workoutId: string) {
    const workout = await this.prisma.workoutSession.findUnique({
      where: { id: workoutId },
    })

    if (!workout) {
      throw new NotFoundException('Workout not found')
    }

    if (workout.userId !== userId) {
      throw new BadRequestException('Unauthorized')
    }

    const logs = await this.prisma.exerciseLog.findMany({
      where: { sessionId: workoutId },
      orderBy: { completedAt: 'asc' },
    })

    const completed = workout.exercisesCompleted || 0
    const total = workout.totalExercises || 1

    return {
      workoutId,
      progress: {
        completed,
        total,
        percentage: Math.round((completed / total) * 100),
      },
      isActive: !workout.endedAt,
      startedAt: workout.startedAt,
      endedAt: workout.endedAt,
      exerciseLogs: logs,
      restPeriod: workout.restPeriodSeconds,
    }
  }

  /**
   * Skip exercise
   */
  async skipExercise(
    userId: string,
    workoutId: string,
    exerciseIndex: number,
    reason?: string
  ) {
    const workout = await this.prisma.workoutSession.findUnique({
      where: { id: workoutId },
    })

    if (!workout) {
      throw new NotFoundException('Workout not found')
    }

    if (workout.userId !== userId) {
      throw new BadRequestException('Unauthorized')
    }

    await this.prisma.exerciseLog.create({
      data: {
        sessionId: workoutId,
        exerciseId: 'placeholder-exercise-id',
        userId,
        skipped: true,
        notes: reason,
        completedAt: new Date(),
      },
    })

    return { message: 'Exercise skipped' }
  }

  /**
   * Get user's workout history
   */
  async getUserWorkoutHistory(userId: string, limit: number = 20) {
    return this.prisma.workoutSession.findMany({
      where: { userId, endedAt: { not: null } },
      orderBy: { endedAt: 'desc' },
      take: limit,
    })
  }

  /**
   * Get workout statistics
   */
  async getWorkoutStats(userId: string) {
    const workouts = await this.prisma.workoutSession.findMany({
      where: { userId, endedAt: { not: null } },
    })

    const completedExercises = await this.prisma.exerciseLog.aggregate({
      where: { userId, skipped: false },
      _sum: { setsCompleted: true },
      _count: true,
    })

    const totalWorkoutTime = workouts.reduce((sum, w) => {
      if (w.endedAt && (w.startTime || w.startedAt)) {
        const startT = w.startTime || w.startedAt
        return sum + (w.endedAt.getTime() - startT.getTime()) / 1000 / 60
      }
      return sum
    }, 0)

    return {
      totalWorkouts: workouts.length,
      totalExercisesCompleted: completedExercises._count,
      totalSetsCompleted: completedExercises._sum.setsCompleted || 0,
      totalWorkoutMinutes: Math.round(totalWorkoutTime),
      averageWorkoutDuration: workouts.length > 0 ? Math.round(totalWorkoutTime / workouts.length) : 0,
      lastWorkout: workouts[0]?.endedAt || null,
    }
  }
}
