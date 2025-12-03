import { PrismaService } from '../prisma/prisma.service';
import { CreateSessionProgressDto } from './dto/session.dto';
export declare class SessionService {
    private prisma;
    constructor(prisma: PrismaService);
    getStudentSessions(studentId: string, from?: string, to?: string): Promise<({
        week: {
            weekNumber: number;
            block: {
                title: string | null;
                programId: string;
            };
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
    })[]>;
    getSessionDetails(sessionId: string, studentId: string): Promise<{
        week: {
            block: {
                title: string | null;
                programId: string;
            };
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
    }>;
    saveProgress(sessionId: string, studentId: string, progressData: CreateSessionProgressDto): Promise<{
        id: string;
        notes: string | null;
        studentId: string;
        progress: import("@prisma/client/runtime/library").JsonValue | null;
        sessionId: string;
        exerciseInstanceId: string | null;
        videos: string[];
        savedAt: Date;
    }>;
    getStudentProgress(sessionId: string, studentId: string): Promise<({
        exerciseInstance: ({
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
        }) | null;
    } & {
        id: string;
        notes: string | null;
        studentId: string;
        progress: import("@prisma/client/runtime/library").JsonValue | null;
        sessionId: string;
        exerciseInstanceId: string | null;
        videos: string[];
        savedAt: Date;
    })[]>;
    addExerciseToSession(sessionId: string, exerciseId: string, coachId: string, config?: {
        sets?: number;
        reps?: number;
        format?: string;
        weight?: number;
        duration?: number;
        notes?: string;
    }): Promise<{
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
    }>;
}
