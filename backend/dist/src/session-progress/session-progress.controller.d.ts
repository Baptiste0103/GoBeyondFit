import { SessionProgressService } from './session-progress.service';
export declare class SessionProgressController {
    private readonly sessionProgressService;
    constructor(sessionProgressService: SessionProgressService);
    getSessionProgress(sessionId: string, req: any): Promise<{
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
