import { PrismaService } from '../prisma/prisma.service';
import { LogViewDto } from './dto/history.dto';
export declare class HistoryService {
    private prisma;
    constructor(prisma: PrismaService);
    logView(userId: string, dto: LogViewDto): Promise<{
        exercise: {
            name: string;
            id: string;
            description: string | null;
            meta: import("@prisma/client/runtime/library").JsonValue;
        };
    } & {
        id: string;
        userId: string;
        exerciseId: string;
        viewedAt: Date;
    }>;
    getUserHistory(userId: string, page: number, limit: number, from?: string, to?: string): Promise<{
        data: ({
            exercise: {
                name: string;
                id: string;
                description: string | null;
                meta: import("@prisma/client/runtime/library").JsonValue;
            };
        } & {
            id: string;
            userId: string;
            exerciseId: string;
            viewedAt: Date;
        })[];
        total: number;
        page: number;
        limit: number;
        pages: number;
    }>;
    getRecentlyViewed(userId: string, limit?: number): Promise<({
        exercise: {
            name: string;
            id: string;
            description: string | null;
            meta: import("@prisma/client/runtime/library").JsonValue;
        };
    } & {
        id: string;
        userId: string;
        exerciseId: string;
        viewedAt: Date;
    })[]>;
    clearHistory(userId: string): Promise<{
        deletedCount: number;
        message: string;
    }>;
    deleteHistoryEntry(userId: string, historyId: string): Promise<{
        message: string;
    }>;
    private cleanupOldHistory;
    getExerciseViewCount(exerciseId: string): Promise<{
        exerciseId: string;
        viewCount: number;
    }>;
    getExerciseUniqueViewCount(exerciseId: string): Promise<{
        exerciseId: string;
        uniqueUserCount: number;
    }>;
}
