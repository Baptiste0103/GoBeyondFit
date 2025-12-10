import { PrismaService } from '../prisma/prisma.service';
import { ExerciseConfigType } from './dto/workout-config.dto';
export declare class WorkoutRunnerService {
    private prisma;
    constructor(prisma: PrismaService);
    private getOrCreateSessionProgress;
    startWorkout(userId: string, sessionId: string, config?: {
        restPeriodSeconds?: number;
        formGuidanceEnabled?: boolean;
    }): Promise<{
        sessionProgressId: string;
        sessionId: string;
        programId: string;
        totalExercises: number;
        progress: import("@prisma/client/runtime/library").JsonValue;
    }>;
    getSessionStatus(userId: string, sessionId: string): Promise<{
        exists: boolean;
        status: string;
        message: string;
        hasProgress?: undefined;
        sessionProgressId?: undefined;
    } | {
        exists: boolean;
        hasProgress: any;
        status: string;
        message: string;
        sessionProgressId: string;
    }>;
    completeExercise(userId: string, sessionProgressId: string, exerciseIndex: number, data: {
        setsCompleted?: number;
        repsCompleted?: number;
        repsPerMinute?: number[];
        totalReps?: number;
        roundsCompleted?: number;
        weight?: number;
        rpe?: number;
        notes?: string;
        videos?: string[];
    }): Promise<{
        sessionProgressId: string;
        sessionProgress: import("@prisma/client/runtime/library").JsonValue;
        status: string | null;
    }>;
    saveExerciseData(userId: string, workoutId: string, exerciseIndex: number, data: {
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
    }): Promise<{
        sessionProgressId: string;
        sessionProgress: import("@prisma/client/runtime/library").JsonValue;
        status: string | null;
        message: string;
    }>;
    endWorkout(userId: string, sessionProgressId: string): Promise<{
        sessionProgressId: string;
        status: string | null;
        completedAt: Date;
    }>;
    getWorkoutProgress(userId: string, sessionProgressId: string): Promise<{
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
    skipExercise(userId: string, sessionProgressId: string, exerciseIndex: number, reason?: string): Promise<{
        message: string;
    }>;
    getUserWorkoutHistory(userId: string, limit?: number): Promise<({
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
    })[]>;
    getSessionProgress(userId: string, sessionId: string): Promise<{
        session: {
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
    }>;
    getOrInitializeSessionProgress(userId: string, sessionId: string): Promise<{
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
    validateExerciseConfig(config: any, type: ExerciseConfigType): boolean;
    validateExerciseProgress(progress: any, type: ExerciseConfigType, config: any): {
        valid: boolean;
        error?: string;
    };
    getCurrentSession(userId: string): Promise<({
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
    }) | null>;
    getWorkoutStats(userId: string): Promise<{
        totalWorkouts: number;
        totalExercisesCompleted: number;
        totalSetsCompleted: number;
        lastWorkout: Date;
    }>;
}
