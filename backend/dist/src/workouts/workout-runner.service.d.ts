import { PrismaService } from '../prisma/prisma.service';
export declare class WorkoutRunnerService {
    private prisma;
    constructor(prisma: PrismaService);
    startWorkout(userId: string, sessionId: string, config?: {
        restPeriodSeconds?: number;
        formGuidanceEnabled?: boolean;
    }): Promise<{
        workoutId: string;
        sessionId: string;
        totalExercises: any;
        restPeriod: number | null;
        formGuidance: boolean | null;
        startedAt: Date;
    }>;
    completeExercise(userId: string, workoutId: string, exerciseIndex: number, data: {
        setsCompleted: number;
        repsPerSet?: number[];
        weight?: number;
        duration?: number;
        notes?: string;
        formRating?: number;
    }): Promise<{
        exerciseLogId: string;
        progress: {
            completed: number;
            total: number;
            percentage: number;
        };
    }>;
    endWorkout(userId: string, workoutId: string): Promise<{
        workoutId: string;
        completedAt: Date | null;
        duration: number;
        exercisesCompleted: number;
        totalExercises: number;
        completionRate: number;
    }>;
    getWorkoutProgress(userId: string, workoutId: string): Promise<{
        workoutId: string;
        progress: {
            completed: number;
            total: number;
            percentage: number;
        };
        isActive: boolean;
        startedAt: Date;
        endedAt: Date | null;
        exerciseLogs: {
            id: string;
            sets: number | null;
            reps: number | null;
            userId: string | null;
            exerciseId: string;
            notes: string | null;
            sessionId: string;
            weight: number | null;
            duration: number | null;
            completedAt: Date | null;
            setsCompleted: number | null;
            formRating: number | null;
            skipped: boolean | null;
            loggedAt: Date;
        }[];
        restPeriod: number | null;
    }>;
    skipExercise(userId: string, workoutId: string, exerciseIndex: number, reason?: string): Promise<{
        message: string;
    }>;
    getUserWorkoutHistory(userId: string, limit?: number): Promise<{
        id: string;
        userId: string;
        title: string | null;
        notes: string | null;
        duration: number | null;
        startedAt: Date;
        startTime: Date | null;
        endedAt: Date | null;
        endTime: Date | null;
        restPeriodSeconds: number | null;
        formGuidanceEnabled: boolean | null;
        exercisesCompleted: number | null;
        totalExercises: number | null;
    }[]>;
    getWorkoutStats(userId: string): Promise<{
        totalWorkouts: number;
        totalExercisesCompleted: number;
        totalSetsCompleted: number;
        totalWorkoutMinutes: number;
        averageWorkoutDuration: number;
        lastWorkout: Date | null;
    }>;
}
