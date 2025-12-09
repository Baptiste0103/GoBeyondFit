import { WorkoutRunnerService } from './workout-runner.service';
export declare class WorkoutRunnerController {
    private readonly workoutService;
    constructor(workoutService: WorkoutRunnerService);
    startWorkout(sessionId: string, config: any, req: any): Promise<{
        sessionProgressId: string;
        sessionId: string;
        programId: string;
        totalExercises: number;
        progress: import("@prisma/client/runtime/library").JsonValue;
    }>;
    getSessionStatus(sessionId: string, req: any): Promise<{
        exists: boolean;
        status: string;
        message: string;
        workoutId?: undefined;
        hasProgress?: undefined;
        sessionProgressId?: undefined;
    } | {
        exists: boolean;
        workoutId: string | undefined;
        hasProgress: any;
        status: string;
        message: string;
        sessionProgressId: string;
    }>;
    getHistory(limit: number | undefined, req: any): Promise<{
        id: string;
        userId: string;
        status: string | null;
        title: string | null;
        notes: string | null;
        programId: string | null;
        sessionId: string | null;
        duration: number | null;
        totalExercises: number | null;
        startedAt: Date;
        startTime: Date | null;
        endedAt: Date | null;
        endTime: Date | null;
        restPeriodSeconds: number | null;
        formGuidanceEnabled: boolean | null;
        exercisesCompleted: number | null;
    }[]>;
    getCurrentSession(req: any): Promise<{
        session: null;
        message: string;
    } | {
        session: {
            id: string;
            userId: string;
            status: string | null;
            title: string | null;
            notes: string | null;
            programId: string | null;
            sessionId: string | null;
            duration: number | null;
            totalExercises: number | null;
            startedAt: Date;
            startTime: Date | null;
            endedAt: Date | null;
            endTime: Date | null;
            restPeriodSeconds: number | null;
            formGuidanceEnabled: boolean | null;
            exercisesCompleted: number | null;
        };
        message?: undefined;
    }>;
    getStats(req: any): Promise<{
        totalWorkouts: number;
        totalExercisesCompleted: number;
        totalSetsCompleted: number;
        totalWorkoutMinutes: number;
        averageWorkoutDuration: number;
        lastWorkout: Date | null;
    }>;
    getSessionProgress(sessionId: string, req: any): Promise<{
        sessionProgress: {
            id: string;
            updatedAt: Date;
            sets: number | null;
            reps: number | null;
            status: string | null;
            format: string | null;
            notes: string | null;
            studentId: string;
            progress: import("@prisma/client/runtime/library").JsonValue | null;
            sessionId: string;
            weight: number | null;
            exerciseInstanceId: string | null;
            videos: string[];
            savedAt: Date;
        };
        session: {
            week: {
                block: {
                    program: {
                        id: string;
                        coachId: string;
                        createdAt: Date;
                        updatedAt: Date;
                        data: import("@prisma/client/runtime/library").JsonValue | null;
                        description: string | null;
                        ownerId: string | null;
                        title: string;
                        isDraft: boolean;
                    };
                } & {
                    id: string;
                    title: string | null;
                    position: number;
                    notes: string | null;
                    programId: string;
                };
            } & {
                id: string;
                position: number;
                weekNumber: number;
                blockId: string;
            };
            exercises: ({
                exercise: {
                    type: import(".prisma/client").$Enums.ExerciseType;
                    name: string;
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    description: string | null;
                    meta: import("@prisma/client/runtime/library").JsonValue | null;
                    scope: import(".prisma/client").$Enums.Scope;
                    ownerId: string | null;
                };
            } & {
                id: string;
                exerciseId: string;
                position: number;
                config: import("@prisma/client/runtime/library").JsonValue | null;
                sessionId: string;
            })[];
        } & {
            id: string;
            data: import("@prisma/client/runtime/library").JsonValue | null;
            title: string | null;
            position: number;
            notes: string | null;
            date: Date | null;
            weekId: string;
        };
        program: {
            id: string;
            coachId: string;
            createdAt: Date;
            updatedAt: Date;
            data: import("@prisma/client/runtime/library").JsonValue | null;
            description: string | null;
            ownerId: string | null;
            title: string;
            isDraft: boolean;
        };
    }>;
    completeExercise(workoutId: string, exerciseIndex: number, data: any, req: any): Promise<{
        sessionProgressId: string;
        sessionProgress: import("@prisma/client/runtime/library").JsonValue;
        status: string | null;
    }>;
    saveExerciseData(workoutId: string, exerciseIndex: number, data: any, req: any): Promise<{
        sessionProgressId: string;
        sessionProgress: import("@prisma/client/runtime/library").JsonValue;
        status: string | null;
        message: string;
    }>;
    skipExercise(workoutId: string, exerciseIndex: number, { reason }: {
        reason?: string;
    }, req: any): Promise<{
        message: string;
    }>;
    endWorkout(workoutId: string, req: any): Promise<{
        sessionProgressId: string;
        status: string | null;
        completedAt: Date;
    }>;
    getProgress(workoutId: string, req: any): Promise<{
        sessionProgressId: string;
        sessionId: string;
        session: {
            week: {
                block: {
                    program: {
                        id: string;
                        coachId: string;
                        createdAt: Date;
                        updatedAt: Date;
                        data: import("@prisma/client/runtime/library").JsonValue | null;
                        description: string | null;
                        ownerId: string | null;
                        title: string;
                        isDraft: boolean;
                    };
                } & {
                    id: string;
                    title: string | null;
                    position: number;
                    notes: string | null;
                    programId: string;
                };
            } & {
                id: string;
                position: number;
                weekNumber: number;
                blockId: string;
            };
            exercises: ({
                exercise: {
                    type: import(".prisma/client").$Enums.ExerciseType;
                    name: string;
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    description: string | null;
                    meta: import("@prisma/client/runtime/library").JsonValue | null;
                    scope: import(".prisma/client").$Enums.Scope;
                    ownerId: string | null;
                };
            } & {
                id: string;
                exerciseId: string;
                position: number;
                config: import("@prisma/client/runtime/library").JsonValue | null;
                sessionId: string;
            })[];
        } & {
            id: string;
            data: import("@prisma/client/runtime/library").JsonValue | null;
            title: string | null;
            position: number;
            notes: string | null;
            date: Date | null;
            weekId: string;
        };
        sessionProgress: {
            session: {
                week: {
                    block: {
                        program: {
                            id: string;
                            coachId: string;
                            createdAt: Date;
                            updatedAt: Date;
                            data: import("@prisma/client/runtime/library").JsonValue | null;
                            description: string | null;
                            ownerId: string | null;
                            title: string;
                            isDraft: boolean;
                        };
                    } & {
                        id: string;
                        title: string | null;
                        position: number;
                        notes: string | null;
                        programId: string;
                    };
                } & {
                    id: string;
                    position: number;
                    weekNumber: number;
                    blockId: string;
                };
                exercises: ({
                    exercise: {
                        type: import(".prisma/client").$Enums.ExerciseType;
                        name: string;
                        id: string;
                        createdAt: Date;
                        updatedAt: Date;
                        description: string | null;
                        meta: import("@prisma/client/runtime/library").JsonValue | null;
                        scope: import(".prisma/client").$Enums.Scope;
                        ownerId: string | null;
                    };
                } & {
                    id: string;
                    exerciseId: string;
                    position: number;
                    config: import("@prisma/client/runtime/library").JsonValue | null;
                    sessionId: string;
                })[];
            } & {
                id: string;
                data: import("@prisma/client/runtime/library").JsonValue | null;
                title: string | null;
                position: number;
                notes: string | null;
                date: Date | null;
                weekId: string;
            };
        } & {
            id: string;
            updatedAt: Date;
            sets: number | null;
            reps: number | null;
            status: string | null;
            format: string | null;
            notes: string | null;
            studentId: string;
            progress: import("@prisma/client/runtime/library").JsonValue | null;
            sessionId: string;
            weight: number | null;
            exerciseInstanceId: string | null;
            videos: string[];
            savedAt: Date;
        };
        status: string;
        progress: {
            completed: any;
            total: any;
            percentage: number;
            summary: any;
        };
    }>;
}
