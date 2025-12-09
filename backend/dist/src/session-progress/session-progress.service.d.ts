import { PrismaService } from '../prisma/prisma.service';
export declare class SessionProgressService {
    private prisma;
    constructor(prisma: PrismaService);
    getProgress(sessionId: string, studentId: string): Promise<{
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
    } | null>;
}
