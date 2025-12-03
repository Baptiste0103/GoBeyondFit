import { WorkoutRunnerService } from './workout-runner.service';
export declare class WorkoutRunnerController {
    private readonly workoutService;
    constructor(workoutService: WorkoutRunnerService);
    startWorkout(sessionId: string, config: any, req: any): Promise<{
        workoutId: string;
        sessionId: string;
        totalExercises: any;
        restPeriod: number | null;
        formGuidance: boolean | null;
        startedAt: Date;
    }>;
    completeExercise(workoutId: string, exerciseIndex: number, data: any, req: any): Promise<{
        exerciseLogId: string;
        progress: {
            completed: number;
            total: number;
            percentage: number;
        };
    }>;
    skipExercise(workoutId: string, exerciseIndex: number, { reason }: {
        reason?: string;
    }, req: any): Promise<{
        message: string;
    }>;
    endWorkout(workoutId: string, req: any): Promise<{
        workoutId: string;
        completedAt: Date | null;
        duration: number;
        exercisesCompleted: number;
        totalExercises: number;
        completionRate: number;
    }>;
    getProgress(workoutId: string, req: any): Promise<{
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
    getHistory(limit: number | undefined, req: any): Promise<{
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
    getStats(req: any): Promise<{
        totalWorkouts: number;
        totalExercisesCompleted: number;
        totalSetsCompleted: number;
        totalWorkoutMinutes: number;
        averageWorkoutDuration: number;
        lastWorkout: Date | null;
    }>;
}
