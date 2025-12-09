import { PrismaService } from '../prisma/prisma.service';
import { UpdateSessionProgressDto } from './dto/workout.dto';
export declare class WorkoutService {
    private prisma;
    constructor(prisma: PrismaService);
    getStudentSessions(studentId: string, startDate?: Date, endDate?: Date): Promise<{
        id: string;
        data: import("@prisma/client/runtime/library").JsonValue | null;
        title: string | null;
        position: number;
        notes: string | null;
        date: Date | null;
        weekId: string;
    }[]>;
    getSessionForWorkout(sessionId: string, studentId: string): Promise<{
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
        progress: {
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
        }[];
    } & {
        id: string;
        data: import("@prisma/client/runtime/library").JsonValue | null;
        title: string | null;
        position: number;
        notes: string | null;
        date: Date | null;
        weekId: string;
    }>;
    saveExerciseProgress(sessionId: string, exerciseInstanceId: string, studentId: string, data: UpdateSessionProgressDto): Promise<{
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
    addVideoToProgress(progressId: string, studentId: string, videoUrl: string): Promise<{
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
    completeSession(sessionId: string, studentId: string, notes?: string): Promise<{
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
}
