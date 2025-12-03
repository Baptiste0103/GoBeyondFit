import { BadgeService } from './badge.service';
export declare class BadgeController {
    private readonly badgeService;
    constructor(badgeService: BadgeService);
    getMyBadges(req: any): Promise<({
        badge: {
            key: string;
            id: string;
            description: import("@prisma/client/runtime/library").JsonValue;
            title: import("@prisma/client/runtime/library").JsonValue;
            criteria: import("@prisma/client/runtime/library").JsonValue;
        };
    } & {
        id: string;
        userId: string;
        badgeId: string;
        awardedAt: Date;
    })[]>;
    getProgress(req: any): Promise<{
        sessionsCompleted: number;
        currentStreak: number;
        maxWeight: number | null;
    }>;
    getAllBadges(): Promise<{
        key: string;
        id: string;
        description: import("@prisma/client/runtime/library").JsonValue;
        title: import("@prisma/client/runtime/library").JsonValue;
        criteria: import("@prisma/client/runtime/library").JsonValue;
    }[]>;
}
