import { HistoryService } from './history.service';
import { LogViewDto } from './dto/history.dto';
export declare class HistoryController {
    private readonly historyService;
    constructor(historyService: HistoryService);
    logView(exerciseId: string, dto: LogViewDto, req: any): Promise<{
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
    getViewCount(exerciseId: string): Promise<{
        exerciseId: string;
        viewCount: number;
    }>;
    getUniqueViewCount(exerciseId: string): Promise<{
        exerciseId: string;
        uniqueUserCount: number;
    }>;
}
export declare class UserHistoryController {
    private readonly historyService;
    constructor(historyService: HistoryService);
    getUserHistory(req: any, page?: number, limit?: number, from?: string, to?: string): Promise<{
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
    getRecentlyViewed(limit: number, req: any): Promise<({
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
    clearHistory(req: any): Promise<{
        deletedCount: number;
        message: string;
    }>;
    deleteEntry(entryId: string, req: any): Promise<{
        message: string;
    }>;
}
