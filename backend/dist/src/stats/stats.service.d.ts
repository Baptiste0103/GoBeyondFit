import { PrismaService } from '../prisma/prisma.service';
export declare class StatsService {
    private prisma;
    constructor(prisma: PrismaService);
    getStudentStats(userId: string): Promise<{
        totalSessions: number;
        completedSessions: number;
        completionRate: number;
        totalVolume: number;
        maxWeight: number | null;
        avgWeight: number;
        currentStreak: number;
        sessionsThisWeek: number;
    }>;
    private getTotalSessions;
    private getCompletedSessions;
    private getTotalVolume;
    private getMaxWeight;
    private getAverageWeight;
    private getCurrentStreak;
    private getSessionsThisWeek;
    getExerciseStats(userId: string, exerciseId: string): Promise<{
        totalSessions: number;
        maxWeight: number;
        avgWeight: number;
        maxReps: number;
        avgReps: number;
        history: any[];
    }>;
}
