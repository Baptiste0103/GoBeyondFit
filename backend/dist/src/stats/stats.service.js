"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let StatsService = class StatsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getStudentStats(userId) {
        const [totalSessions, completedSessions, totalVolume, maxWeight, avgWeight, streak, sessionsThisWeek,] = await Promise.all([
            this.getTotalSessions(userId),
            this.getCompletedSessions(userId),
            this.getTotalVolume(userId),
            this.getMaxWeight(userId),
            this.getAverageWeight(userId),
            this.getCurrentStreak(userId),
            this.getSessionsThisWeek(userId),
        ]);
        return {
            totalSessions,
            completedSessions,
            completionRate: totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0,
            totalVolume: Math.round(totalVolume),
            maxWeight,
            avgWeight: avgWeight ? Math.round(avgWeight * 100) / 100 : 0,
            currentStreak: streak,
            sessionsThisWeek,
        };
    }
    async getTotalSessions(userId) {
        const assignments = await this.prisma.programAssignment.findMany({
            where: { studentId: userId },
            include: {
                program: {
                    include: {
                        blocks: {
                            include: {
                                weeks: {
                                    include: {
                                        sessions: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
        let totalSessions = 0;
        assignments.forEach((assignment) => {
            assignment.program.blocks.forEach((block) => {
                block.weeks.forEach((week) => {
                    totalSessions += week.sessions.length;
                });
            });
        });
        return totalSessions;
    }
    async getCompletedSessions(userId) {
        const completed = await this.prisma.sessionProgress.findMany({
            where: {
                studentId: userId,
                progress: {
                    path: ['completed'],
                    equals: true,
                },
            },
            select: {
                sessionId: true,
            },
        });
        return new Set(completed.map((c) => c.sessionId)).size;
    }
    async getTotalVolume(userId) {
        const progressRecords = await this.prisma.sessionProgress.findMany({
            where: {
                studentId: userId,
            },
            select: {
                progress: true,
            },
        });
        let totalVolume = 0;
        progressRecords.forEach((record) => {
            const progress = record.progress;
            if (progress && progress.sets && Array.isArray(progress.sets)) {
                progress.sets.forEach((set) => {
                    if (set.weight && set.reps) {
                        totalVolume += set.weight * set.reps;
                    }
                });
            }
        });
        return totalVolume;
    }
    async getMaxWeight(userId) {
        const progressRecords = await this.prisma.sessionProgress.findMany({
            where: {
                studentId: userId,
            },
            select: {
                progress: true,
            },
        });
        let maxWeight = 0;
        progressRecords.forEach((record) => {
            const progress = record.progress;
            if (progress && progress.sets && Array.isArray(progress.sets)) {
                progress.sets.forEach((set) => {
                    if (set.weight && set.weight > maxWeight) {
                        maxWeight = set.weight;
                    }
                });
            }
        });
        return maxWeight > 0 ? maxWeight : null;
    }
    async getAverageWeight(userId) {
        const progressRecords = await this.prisma.sessionProgress.findMany({
            where: {
                studentId: userId,
            },
            select: {
                progress: true,
            },
        });
        let totalWeight = 0;
        let setCount = 0;
        progressRecords.forEach((record) => {
            const progress = record.progress;
            if (progress && progress.sets && Array.isArray(progress.sets)) {
                progress.sets.forEach((set) => {
                    if (set.weight) {
                        totalWeight += set.weight;
                        setCount++;
                    }
                });
            }
        });
        return setCount > 0 ? totalWeight / setCount : null;
    }
    async getCurrentStreak(userId) {
        let streak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        for (let i = 0; i < 365; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const nextDate = new Date(date);
            nextDate.setDate(nextDate.getDate() + 1);
            const hasCompletedSession = await this.prisma.sessionProgress.findFirst({
                where: {
                    studentId: userId,
                    progress: {
                        path: ['completed'],
                        equals: true,
                    },
                    savedAt: {
                        gte: date,
                        lt: nextDate,
                    },
                },
            });
            if (hasCompletedSession) {
                streak++;
            }
            else if (streak > 0) {
                break;
            }
        }
        return streak;
    }
    async getSessionsThisWeek(userId) {
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const completed = await this.prisma.sessionProgress.findMany({
            where: {
                studentId: userId,
                progress: {
                    path: ['completed'],
                    equals: true,
                },
                savedAt: {
                    gte: weekAgo,
                },
            },
            select: {
                sessionId: true,
            },
        });
        return new Set(completed.map((c) => c.sessionId)).size;
    }
    async getExerciseStats(userId, exerciseId) {
        const progressRecords = await this.prisma.sessionProgress.findMany({
            where: {
                studentId: userId,
                session: {
                    exercises: {
                        some: {
                            exerciseId,
                        },
                    },
                },
            },
            select: {
                progress: true,
                savedAt: true,
            },
            orderBy: {
                savedAt: 'desc',
            },
            take: 20,
        });
        const stats = {
            totalSessions: progressRecords.length,
            maxWeight: 0,
            avgWeight: 0,
            maxReps: 0,
            avgReps: 0,
            history: [],
        };
        let totalWeight = 0;
        let totalReps = 0;
        let setCount = 0;
        progressRecords.forEach((record) => {
            const progress = record.progress;
            if (progress && progress.sets && Array.isArray(progress.sets)) {
                const sessionData = {
                    date: record.savedAt,
                    sets: [],
                };
                progress.sets.forEach((set) => {
                    if (set.weight) {
                        totalWeight += set.weight;
                        stats.maxWeight = Math.max(stats.maxWeight, set.weight);
                        sessionData.sets.push({
                            weight: set.weight,
                            reps: set.reps || 0,
                        });
                    }
                    if (set.reps) {
                        totalReps += set.reps;
                        stats.maxReps = Math.max(stats.maxReps, set.reps);
                    }
                    setCount++;
                });
                if (sessionData.sets.length > 0) {
                    stats.history.push(sessionData);
                }
            }
        });
        stats.avgWeight = setCount > 0 ? Math.round((totalWeight / setCount) * 100) / 100 : 0;
        stats.avgReps = setCount > 0 ? Math.round((totalReps / setCount) * 100) / 100 : 0;
        return stats;
    }
};
exports.StatsService = StatsService;
exports.StatsService = StatsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StatsService);
//# sourceMappingURL=stats.service.js.map