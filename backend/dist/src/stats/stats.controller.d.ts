import { StatsService } from './stats.service';
export declare class StatsController {
    private readonly statsService;
    constructor(statsService: StatsService);
    getMyStats(req: any): Promise<{
        totalSessions: number;
        completedSessions: number;
        completionRate: number;
        totalVolume: number;
        maxWeight: number | null;
        avgWeight: number;
        currentStreak: number;
        sessionsThisWeek: number;
    }>;
    getExerciseStats(req: any, exerciseId: string): Promise<{
        totalSessions: number;
        maxWeight: number;
        avgWeight: number;
        maxReps: number;
        avgReps: number;
        history: any[];
    }>;
}
