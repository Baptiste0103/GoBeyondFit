import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import {
  ExerciseConfigType,
  StandardExerciseConfig,
  EMOMExerciseConfig,
  AMRAPExerciseConfig,
  CircuitExerciseConfig,
  ExerciseInstanceConfig,
} from './dto/workout-config.dto'
import {
  ProgressStatus,
  StandardExerciseProgress,
  EMOMExerciseProgress,
  AMRAPExerciseProgress,
  CircuitExerciseProgress,
} from './dto/workout-progress.dto'

@Injectable()
export class WorkoutRunnerService {
  constructor(private prisma: PrismaService) {}

  /**
   * Fetch or create unique SessionProgress record
   */
  private async getOrCreateSessionProgress(
    sessionId: string,
    studentId: string,
    session: any
  ) {
    // Try to find existing SessionProgress
    let sessionProgress = await this.prisma.sessionProgress.findFirst({
      where: {
        sessionId,
        studentId,
      },
    })

    // If doesn't exist, create new one with full session data
    if (!sessionProgress) {
      const exercisesData = session.exercises?.map((ex: any, index: number) => {
        // Initialize data structure based on exercise type
        let data = {}
        const exerciseType = ex.exercise?.type || 'standard'

        switch (exerciseType) {
          case 'EMOM':
            data = { repsPerMinute: [], rpe: null, notes: '' }
            break
          case 'AMRAP':
            data = { totalReps: 0, rpe: null, notes: '' }
            break
          case 'circuit':
            data = { roundsCompleted: 0, totalReps: 0, weightUsed: null, rpe: null, notes: '' }
            break
          case 'standard':
          default:
            data = { setsCompleted: 0, repsCompleted: 0, weightUsed: null, rpe: null, notes: '' }
        }

        return {
          position: index,
          exerciseId: ex.exerciseId,
          exerciseName: ex.exercise?.name,
          exerciseType,
          config: ex.config,
          status: 'not_started',
          data,
          notes: '',
          videos: [],
        }
      }) || []

      sessionProgress = await this.prisma.sessionProgress.create({
        data: {
          sessionId,
          studentId,
          status: 'not_started',
          progress: {
            sessionId: session.id,
            sessionTitle: session.title || '',
            sessionNotes: session.notes || '',
            week: session.week?.weekNumber || 0,
            block: session.week?.block?.title || '',
            program: session.week?.block?.program?.title || '',
            exercises: exercisesData,
            summary: {
              totalExercises: exercisesData.length,
              completedExercises: 0,
              inProgressExercises: 0,
            },
          },
          videos: [],
          notes: session.notes,
        },
      })
    }

    return sessionProgress
  }

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
    // Verify session exists and load full hierarchy
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        week: {
          include: {
            block: {
              include: {
                program: true,
              },
            },
          },
        },
        exercises: {
          include: {
            exercise: true,
          },
        },
      },
    })

    if (!session) {
      throw new NotFoundException('Session not found')
    }

    // Get program from the session hierarchy
    const program = session.week?.block?.program
    if (!program) {
      throw new NotFoundException('Program not found for this session')
    }

    // Verify student is assigned to this program
    const assignment = await this.prisma.programAssignment.findFirst({
      where: {
        programId: program.id,
        studentId: userId,
      },
    })

    if (!assignment) {
      throw new BadRequestException('Student not assigned to this program')
    }

    // Get or create unique SessionProgress record
    // SessionProgress is now the PRIMARY data store (WorkoutSession removed)
    const sessionProgress = await this.getOrCreateSessionProgress(session.id, userId, session)

    const totalExercises = session.exercises?.length || 0

    console.log(`🟢 [startWorkout] SessionProgress ID: ${sessionProgress.id}`)

    return {
      sessionProgressId: sessionProgress.id,
      sessionId,
      programId: program.id,
      totalExercises,
      progress: sessionProgress.progress,
    }
  }

  /**
   * Check if a session has progress for this user
   * Returns: { exists: boolean, workoutId?: string, hasProgress: boolean }
   */
  async getSessionStatus(userId: string, sessionId: string) {
    // Check if SessionProgress exists
    const sessionProgress = await this.prisma.sessionProgress.findFirst({
      where: {
        sessionId,
        studentId: userId,
      },
    })

    if (!sessionProgress) {
      // No progress yet - user should click "Commencer" to start new
      return {
        exists: false,
        status: 'not_started',
        message: 'Commencer',
      }
    }

    // SessionProgress exists - check if there's actual progress data
    const hasProgress = sessionProgress.progress && 
                       (sessionProgress.progress as any).exercises?.some((ex: any) => 
                         ex.data && Object.keys(ex.data).some(k => ex.data[k] !== null && ex.data[k] !== 0 && ex.data[k] !== '')
                       )

    return {
      exists: true,
      hasProgress: hasProgress || false,
      status: hasProgress ? 'in_progress' : 'started',
      message: hasProgress ? 'Modifier' : 'Commencer',
      sessionProgressId: sessionProgress.id,
    }
  }

  /**
   * Complete an exercise in workout
   */
  async completeExercise(
    userId: string,
    sessionProgressId: string,
    exerciseIndex: number,
    data: {
      setsCompleted?: number;
      repsCompleted?: number;
      repsPerMinute?: number[];
      totalReps?: number;
      roundsCompleted?: number;
      weight?: number;
      rpe?: number;
      notes?: string;
      videos?: string[];
    }
  ) {
    console.log(`🔵 [completeExercise] START - userId: ${userId}, sessionProgressId: ${sessionProgressId}, exerciseIndex: ${exerciseIndex}`)
    
    const sessionProgress = await this.prisma.sessionProgress.findUnique({
      where: { id: sessionProgressId },
    })

    if (!sessionProgress) {
      throw new NotFoundException('SessionProgress not found')
    }

    if (sessionProgress.studentId !== userId) {
      throw new BadRequestException('Unauthorized')
    }

    if (!sessionProgress.sessionId) {
      throw new BadRequestException('SessionProgress not linked to a session')
    }

    // Get the session to access exercises
    const session = await this.prisma.session.findUnique({
      where: { id: sessionProgress.sessionId },
      include: {
        exercises: {
          include: {
            exercise: true,
          },
        },
      },
    })

    if (!session) {
      throw new NotFoundException('Session not found')
    }

    const sessionExercise = session.exercises?.[exerciseIndex]
    if (!sessionExercise) {
      throw new NotFoundException('Exercise not found in session')
    }

    // Update SessionProgress with completed exercise data
    const progressData = (sessionProgress.progress as any) || {}

    if (!progressData.exercises) {
      progressData.exercises = []
    }

    // Mettre à jour l'exercice avec status 'completed' (données adaptées au type)
    if (progressData.exercises[exerciseIndex]) {
      const exerciseData = progressData.exercises[exerciseIndex]
      const exerciseType = sessionExercise.exercise?.type || 'standard'

      // Mettre à jour les données selon le type d'exercice
      switch (exerciseType) {
        case 'EMOM':
          exerciseData.data = {
            repsPerMinute: data.repsPerMinute || exerciseData.data?.repsPerMinute || [],
            rpe: data.rpe || exerciseData.data?.rpe,
            notes: data.notes || exerciseData.data?.notes || '',
          }
          break
        case 'AMRAP':
          exerciseData.data = {
            totalReps: data.totalReps || exerciseData.data?.totalReps || 0,
            rpe: data.rpe || exerciseData.data?.rpe,
            notes: data.notes || exerciseData.data?.notes || '',
          }
          break
        case 'circuit':
          exerciseData.data = {
            roundsCompleted: data.roundsCompleted || exerciseData.data?.roundsCompleted || 0,
            totalReps: data.totalReps || exerciseData.data?.totalReps || 0,
            weightUsed: data.weight || exerciseData.data?.weightUsed,
            rpe: data.rpe || exerciseData.data?.rpe,
            notes: data.notes || exerciseData.data?.notes || '',
          }
          break
        case 'standard':
        default:
          exerciseData.data = {
            setsCompleted: data.setsCompleted || exerciseData.data?.setsCompleted || 0,
            repsCompleted: data.repsCompleted || exerciseData.data?.repsCompleted || 0,
            weightUsed: data.weight || exerciseData.data?.weightUsed,
            rpe: data.rpe || exerciseData.data?.rpe,
            notes: data.notes || exerciseData.data?.notes || '',
          }
      }

      // Ajouter les vidéos
      if (data.videos) {
        exerciseData.videos = [...new Set([...(exerciseData.videos || []), ...data.videos])]
      }

      // Marquer comme complété
      exerciseData.status = 'completed'
    }

    // Mettre à jour le résumé
    const summary = progressData.summary || {}
    summary.completedExercises = progressData.exercises?.filter((ex: any) => ex.status === 'completed').length || 0
    summary.inProgressExercises = progressData.exercises?.filter((ex: any) => ex.status === 'in_progress').length || 0
    summary.skippedExercises = progressData.exercises?.filter((ex: any) => ex.status === 'skipped').length || 0

    progressData.summary = summary

    // Déterminer le statut global
    let newStatus = 'not_started'
    if (summary.completedExercises === summary.completedExercises && summary.completedExercises > 0) {
      newStatus = 'completed'
    } else if (summary.completedExercises > 0 || summary.inProgressExercises > 0) {
      newStatus = 'partial'
    }

    // Update SessionProgress
    const updatedSessionProgress = await this.prisma.sessionProgress.update({
      where: { id: sessionProgress.id },
      data: {
        progress: progressData,
        status: newStatus,
        videos: data.videos ? [...(sessionProgress.videos || []), ...data.videos] : sessionProgress.videos,
        notes: data.notes || sessionProgress.notes,
        updatedAt: new Date(),
      },
    })

    console.log(`🟢 [completeExercise] SUCCESS - Exercise completed`)

    return {
      sessionProgressId: updatedSessionProgress.id,
      sessionProgress: updatedSessionProgress.progress,
      status: updatedSessionProgress.status,
    }
  }

  /**
   * Save exercise data without marking as completed (draft save)
   */
  /**
   * Save exercise data without marking as completed (draft save)
   */
  async saveExerciseData(
    userId: string,
    workoutId: string,
    exerciseIndex: number,
    data: {
      setsCompleted?: number;
      repsCompleted?: number;
      repsPerSet?: number[];
      repsPerMinute?: number[];
      totalReps?: number;
      roundsCompleted?: number;
      weight?: number;
      rpe?: number;
      notes?: string;
      videos?: string[];
    }
  ) {
    console.log(`🔵 [saveExerciseData] START - userId: ${userId}, sessionProgressId: ${workoutId}, exerciseIndex: ${exerciseIndex}`)

    // Get SessionProgress using the workoutId (which is actually sessionProgressId)
    const initialSessionProgress = await this.prisma.sessionProgress.findUnique({
      where: { id: workoutId },
      include: {
        session: {
          include: {
            exercises: {
              include: {
                exercise: true,
              },
            },
          },
        },
      },
    })

    if (!initialSessionProgress) {
      throw new NotFoundException('SessionProgress not found')
    }

    if (initialSessionProgress.studentId !== userId) {
      throw new BadRequestException('Unauthorized')
    }

    const session = initialSessionProgress.session

    if (!session) {
      throw new NotFoundException('Session not found')
    }

    const sessionExercise = session.exercises?.[exerciseIndex]
    if (!sessionExercise) {
      throw new NotFoundException('Exercise not found in session')
    }

    // Get or create SessionProgress
    let sessionProgress = await this.prisma.sessionProgress.findFirst({
      where: {
        sessionId: session.id,
        studentId: userId,
      },
    })

    if (!sessionProgress) {
      sessionProgress = await this.getOrCreateSessionProgress(session.id, userId, session)
    }

    // Update SessionProgress
    const progressData = (sessionProgress.progress as any) || {}
    
    // If exercises array is missing or empty, reinitialize it from session
    if (!progressData.exercises || progressData.exercises.length === 0) {
      const exercisesData = session.exercises?.map((ex: any, index: number) => {
        // Initialize data structure based on exercise type
        let data = {}
        const exerciseType = ex.exercise?.type || 'standard'

        switch (exerciseType) {
          case 'EMOM':
            data = { repsPerMinute: [], rpe: null, notes: '' }
            break
          case 'AMRAP':
            data = { totalReps: 0, rpe: null, notes: '' }
            break
          case 'circuit':
            data = { roundsCompleted: 0, totalReps: 0, weightUsed: null, rpe: null, notes: '' }
            break
          case 'standard':
          default:
            data = { setsCompleted: 0, repsCompleted: 0, weightUsed: null, rpe: null, notes: '' }
        }

        return {
          position: index,
          exerciseId: ex.exerciseId,
          exerciseName: ex.exercise?.name,
          exerciseType,
          config: ex.config,
          status: 'not_started',
          data,
          notes: '',
          videos: [],
        }
      }) || []
      progressData.exercises = exercisesData
    }

    // Mettre à jour les données de l'exercice (adapté au type)
    if (progressData.exercises && progressData.exercises[exerciseIndex]) {
      const exerciseData = progressData.exercises[exerciseIndex]
      const exerciseType = sessionExercise.exercise?.type || 'standard'

      console.log(`🔵 [saveExerciseData] Exercise type: ${exerciseType}, data:`, data)

      // Mettre à jour les données selon le type d'exercice
      switch (exerciseType) {
        case 'EMOM':
          exerciseData.data = {
            repsPerMinute: data.repsPerMinute || exerciseData.data?.repsPerMinute || [],
            rpe: data.rpe || exerciseData.data?.rpe,
            notes: data.notes || exerciseData.data?.notes || '',
          }
          break
        case 'AMRAP':
          exerciseData.data = {
            totalReps: data.totalReps || exerciseData.data?.totalReps || 0,
            rpe: data.rpe || exerciseData.data?.rpe,
            notes: data.notes || exerciseData.data?.notes || '',
          }
          break
        case 'circuit':
          exerciseData.data = {
            roundsCompleted: data.roundsCompleted || exerciseData.data?.roundsCompleted || 0,
            totalReps: data.totalReps || exerciseData.data?.totalReps || 0,
            weightUsed: data.weight || exerciseData.data?.weightUsed,
            rpe: data.rpe || exerciseData.data?.rpe,
            notes: data.notes || exerciseData.data?.notes || '',
          }
          break
        case 'standard':
        default:
          // Frontend sends: setsCompleted (count), repsPerSet (array of reps per set), weight, notes
          const repsPerSetArray = data.repsPerSet || []
          const totalRepsFormed = repsPerSetArray.reduce((sum: number, reps: number) => sum + (reps || 0), 0)
          
          console.log(`🟡 [saveExerciseData] DEBUG - repsPerSetArray:`, repsPerSetArray)
          console.log(`🟡 [saveExerciseData] DEBUG - totalRepsFormed:`, totalRepsFormed)
          console.log(`🟡 [saveExerciseData] DEBUG - data.setsCompleted:`, data.setsCompleted)
          
          exerciseData.data = {
            setsCompleted: data.setsCompleted || exerciseData.data?.setsCompleted || 0,
            repsPerSet: repsPerSetArray, // Store all reps per set
            repsCompleted: totalRepsFormed, // Total reps across all sets
            weightUsed: data.weight !== undefined ? data.weight : exerciseData.data?.weightUsed,
            rpe: data.rpe || exerciseData.data?.rpe,
            notes: data.notes || exerciseData.data?.notes || '',
          }
          console.log(`🟡 [saveExerciseData] Standard exercise updated:`, exerciseData.data)
      }

      // Ajouter les vidéos
      if (data.videos && data.videos.length > 0) {
        exerciseData.videos = [...new Set([...(exerciseData.videos || []), ...data.videos])]
        console.log(`🟡 [saveExerciseData] Videos added:`, exerciseData.videos)
      }

      // Mettre à jour le statut
      if (exerciseData.status !== 'completed') {
        exerciseData.status = 'in_progress'
      }

      console.log(`🟡 [saveExerciseData] Exercise status updated to:`, exerciseData.status)
    }

    // Mettre à jour le résumé
    const summary = progressData.summary || {}
    summary.completedExercises = progressData.exercises?.filter((ex: any) => ex.status === 'completed').length || 0
    summary.inProgressExercises = progressData.exercises?.filter((ex: any) => ex.status === 'in_progress').length || 0
    summary.totalExercises = progressData.exercises?.length || 0

    progressData.summary = summary
    progressData.metadata = progressData.metadata || {}
    progressData.metadata.lastModifiedAt = new Date()

    // Update SessionProgress
    const updatedSessionProgress = await this.prisma.sessionProgress.update({
      where: { id: sessionProgress.id },
      data: {
        progress: progressData,
        videos: data.videos ? [...new Set([...(sessionProgress.videos || []), ...data.videos])] : sessionProgress.videos,
        notes: data.notes || sessionProgress.notes,
        updatedAt: new Date(),
      },
    })

    console.log(`🟢 [saveExerciseData] SessionProgress updated: ${updatedSessionProgress.id}`)

    return {
      sessionProgressId: updatedSessionProgress.id,
      sessionProgress: updatedSessionProgress.progress,
      status: updatedSessionProgress.status,
      message: 'Exercise data saved',
    }
  }

  /**
   * End workout session
   */
  async endWorkout(userId: string, sessionProgressId: string) {
    const sessionProgress = await this.prisma.sessionProgress.findUnique({
      where: { id: sessionProgressId },
    })

    if (!sessionProgress) {
      throw new NotFoundException('SessionProgress not found')
    }

    if (sessionProgress.studentId !== userId) {
      throw new BadRequestException('Unauthorized')
    }

    const endTime = new Date()
    
    // Update SessionProgress status to completed
    const updatedSessionProgress = await this.prisma.sessionProgress.update({
      where: { id: sessionProgressId },
      data: {
        status: 'completed',
        updatedAt: endTime,
      },
    })

    return {
      sessionProgressId: updatedSessionProgress.id,
      status: updatedSessionProgress.status,
      completedAt: endTime,
    }
  }

  /**
   * Get workout progress - loads SessionProgress which contains all exercise data
   * SessionProgress is the SOURCE OF TRUTH for all exercise data
   */
  async getWorkoutProgress(userId: string, sessionProgressId: string) {
    // Get SessionProgress (sessionProgressId from URL)
    const sessionProgress = await this.prisma.sessionProgress.findUnique({
      where: { id: sessionProgressId },
      include: {
        session: {
          include: {
            exercises: {
              include: {
                exercise: true,
              },
            },
            week: {
              include: {
                block: {
                  include: {
                    program: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!sessionProgress) {
      throw new NotFoundException('SessionProgress not found')
    }

    if (sessionProgress.studentId !== userId) {
      throw new BadRequestException('Unauthorized')
    }

    const session = sessionProgress.session

    if (!session) {
      throw new NotFoundException('Session not found')
    }

    // Calculate progress from SessionProgress data
    const progressData = (sessionProgress.progress as any) || {}
    const exercises = progressData.exercises || []
    const summary = progressData.summary || {}
    
    const completed = summary.completedExercises || 0
    const total = summary.totalExercises || session.exercises?.length || 0

    // Return SessionProgress as the primary data source
    return {
      sessionProgressId,
      sessionId: session.id,
      session,
      sessionProgress, // SOURCE OF TRUTH - contains all exercise data in progress.exercises array
      status: sessionProgress.status || 'not_started',
      progress: {
        completed,
        total,
        percentage: Math.round((completed / total) * 100),
        summary, // Exercise counts by status
      },
    }
  }

  /**
   * Skip exercise
   */
  async skipExercise(
    userId: string,
    sessionProgressId: string,
    exerciseIndex: number,
    reason?: string
  ) {
    const sessionProgress = await this.prisma.sessionProgress.findUnique({
      where: { id: sessionProgressId },
    })

    if (!sessionProgress) {
      throw new NotFoundException('SessionProgress not found')
    }

    if (sessionProgress.studentId !== userId) {
      throw new BadRequestException('Unauthorized')
    }

    // Update exercise status to skipped in SessionProgress
    const progressData = (sessionProgress.progress as any) || {}
    const exercises = progressData.exercises || []
    
    if (exercises[exerciseIndex]) {
      exercises[exerciseIndex].status = 'skipped'
      exercises[exerciseIndex].notes = reason || 'Exercise skipped'
    }

    await this.prisma.sessionProgress.update({
      where: { id: sessionProgressId },
      data: {
        progress: {
          ...progressData,
          exercises,
        },
      },
    })

    return { message: 'Exercise skipped' }
  }

  /**
   * Get user's workout history
   */
  async getUserWorkoutHistory(userId: string, limit: number = 20) {
    return this.prisma.sessionProgress.findMany({
      where: { studentId: userId, status: 'completed' },
      orderBy: { updatedAt: 'desc' },
      take: limit,
      include: {
        session: {
          include: {
            week: {
              include: {
                block: {
                  include: {
                    program: true,
                  },
                },
              },
            },
          },
        },
      },
    })
  }

  /**
   * Get session progress for a student
   */
  async getSessionProgress(userId: string, sessionId: string) {
    const sessionProgress = await this.prisma.sessionProgress.findFirst({
      where: {
        sessionId,
        studentId: userId,
      },
      include: {
        session: {
          include: {
            exercises: {
              include: {
                exercise: true,
              },
            },
          },
        },
      },
    })

    if (!sessionProgress) {
      throw new NotFoundException('Session progress not found')
    }

    return sessionProgress
  }

  /**
   * Get or initialize session progress
   */
  async getOrInitializeSessionProgress(userId: string, sessionId: string) {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        exercises: {
          include: {
            exercise: true,
          },
        },
        week: {
          include: {
            block: {
              include: {
                program: true,
              },
            },
          },
        },
      },
    })

    if (!session) {
      throw new NotFoundException('Session not found')
    }

    // Get or create session progress
    let sessionProgress = await this.prisma.sessionProgress.findFirst({
      where: {
        sessionId,
        studentId: userId,
      },
    })

    if (!sessionProgress) {
      sessionProgress = await this.getOrCreateSessionProgress(sessionId, userId, session)
    }

    return {
      sessionProgress,
      session,
      program: session.week?.block?.program,
    }
  }

  /**
   * Validate exercise config based on type
   */
  validateExerciseConfig(config: any, type: ExerciseConfigType): boolean {
    switch (type) {
      case ExerciseConfigType.STANDARD:
        return config.sets > 0 && config.reps > 0
      case ExerciseConfigType.EMOM:
        return config.totalMinutes > 0 && config.totalMinutes <= 60 && config.repsPerMinute > 0
      case ExerciseConfigType.AMRAP:
        return config.timeMinutes > 0 && config.timeMinutes <= 60 && config.targetReps > 0
      case ExerciseConfigType.CIRCUIT:
        return config.rounds > 0 && config.repsPerRound > 0
      default:
        return false
    }
  }

  /**
   * Validate exercise progress based on type
   */
  validateExerciseProgress(
    progress: any,
    type: ExerciseConfigType,
    config: any
  ): { valid: boolean; error?: string } {
    switch (type) {
      case ExerciseConfigType.STANDARD:
        if (progress.setsCompleted <= 0 || progress.repsCompleted <= 0) {
          return { valid: false, error: 'Sets and reps must be positive' }
        }
        return { valid: true }

      case ExerciseConfigType.EMOM:
        if (!Array.isArray(progress.repsPerMinute)) {
          return { valid: false, error: 'repsPerMinute must be an array' }
        }
        if (progress.repsPerMinute.length > config.totalMinutes) {
          return {
            valid: false,
            error: `Cannot have more than ${config.totalMinutes} minute entries`,
          }
        }
        return { valid: true }

      case ExerciseConfigType.AMRAP:
        if (progress.totalReps <= 0) {
          return { valid: false, error: 'Total reps must be positive' }
        }
        return { valid: true }

      case ExerciseConfigType.CIRCUIT:
        if (progress.roundsCompleted <= 0 || progress.totalReps <= 0) {
          return { valid: false, error: 'Rounds and total reps must be positive' }
        }
        return { valid: true }

      default:
        return { valid: false, error: 'Unknown exercise type' }
    }
  }

  /**
   * Get current or today's incomplete session for quick access
   */
  async getCurrentSession(userId: string) {
    // Try to find active session (not completed)
    const session = await this.prisma.sessionProgress.findFirst({
      where: {
        studentId: userId,
        status: { not: 'completed' },
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        session: {
          include: {
            week: {
              include: {
                block: {
                  include: {
                    program: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    return session || null
  }

  /**
   * Get workout statistics
   */
  async getWorkoutStats(userId: string) {
    const completedSessions = await this.prisma.sessionProgress.findMany({
      where: { studentId: userId, status: 'completed' },
    })

    let totalSetsCompleted = 0
    let totalExercisesCompleted = 0

    // Calculate stats from SessionProgress data
    for (const sp of completedSessions) {
      const progressData = (sp.progress as any) || {}
      const exercises = progressData.exercises || []
      
      exercises.forEach((ex: any) => {
        if (ex.status === 'completed') {
          totalExercisesCompleted++
          if (ex.data?.setsCompleted) {
            totalSetsCompleted += ex.data.setsCompleted
          }
        }
      })
    }

    return {
      totalWorkouts: completedSessions.length,
      totalExercisesCompleted,
      totalSetsCompleted,
      lastWorkout: completedSessions[0]?.updatedAt || null,
    }
  }
}
