import { SessionService } from './session.service';
import { CreateSessionProgressDto, AddExerciseToSessionDto } from './dto/session.dto';
export declare class SessionController {
    private readonly sessionService;
    constructor(sessionService: SessionService);
    getMySessions(req: any, from?: string, to?: string): Promise<({
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
    getSession(sessionId: string, req: any): Promise<{
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
    saveProgress(sessionId: string, progressData: CreateSessionProgressDto, req: any): Promise<{
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
    getMyProgress(sessionId: string, req: any): Promise<{
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
    }[]>;
    addExerciseToSession(sessionId: string, addExerciseDto: AddExerciseToSessionDto, req: any): Promise<{
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
