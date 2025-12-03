import { PrismaService } from '../prisma/prisma.service';
export declare enum BadgeEvent {
    SESSION_COMPLETED = "session_completed",
    PERFECT_SESSION = "perfect_session",
    STREAK_7_DAYS = "streak_7_days",
    STREAK_30_DAYS = "streak_30_days",
    PERSONAL_RECORD = "personal_record",
    TOTAL_VOLUME_MILESTONE = "total_volume_milestone"
}
export declare class BadgeService {
    private prisma;
    constructor(prisma: PrismaService);
    awardBadgeIfEarned(userId: string, event: BadgeEvent, metadata?: Record<string, any>): Promise<any | null>;
    private checkCriteria;
    private checkStreak;
    getAllBadges(): Promise<{
        key: string;
        id: string;
        description: import("@prisma/client/runtime/library").JsonValue;
        title: import("@prisma/client/runtime/library").JsonValue;
        criteria: import("@prisma/client/runtime/library").JsonValue;
    }[]>;
    getUserBadges(userId: string): Promise<({
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
    getBadgeProgress(userId: string): Promise<{
        sessionsCompleted: number;
        currentStreak: number;
        maxWeight: number | null;
    }>;
    private calculateStreak;
    private getMaxWeight;
}
