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
exports.BadgeService = exports.BadgeEvent = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
var BadgeEvent;
(function (BadgeEvent) {
    BadgeEvent["SESSION_COMPLETED"] = "session_completed";
    BadgeEvent["PERFECT_SESSION"] = "perfect_session";
    BadgeEvent["STREAK_7_DAYS"] = "streak_7_days";
    BadgeEvent["STREAK_30_DAYS"] = "streak_30_days";
    BadgeEvent["PERSONAL_RECORD"] = "personal_record";
    BadgeEvent["TOTAL_VOLUME_MILESTONE"] = "total_volume_milestone";
})(BadgeEvent || (exports.BadgeEvent = BadgeEvent = {}));
let BadgeService = class BadgeService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async awardBadgeIfEarned(userId, event, metadata) {
        try {
            const badge = await this.prisma.badge.findUnique({
                where: { key: event },
            });
            if (!badge) {
                return null;
            }
            const existing = await this.prisma.userBadge.findFirst({
                where: {
                    userId,
                    badgeId: badge.id,
                },
            });
            if (existing) {
                return existing;
            }
            const criteria = badge.criteria || {};
            const shouldAward = await this.checkCriteria(userId, event, metadata, criteria);
            if (shouldAward) {
                return this.prisma.userBadge.create({
                    data: {
                        userId,
                        badgeId: badge.id,
                    },
                    include: {
                        badge: true,
                    },
                });
            }
            return null;
        }
        catch (error) {
            console.error('Error awarding badge:', error);
            return null;
        }
    }
    async checkCriteria(userId, event, metadata = {}, criteria) {
        switch (event) {
            case BadgeEvent.SESSION_COMPLETED:
                return true;
            case BadgeEvent.PERFECT_SESSION:
                return metadata?.allExercisesCompleted === true;
            case BadgeEvent.STREAK_7_DAYS:
                return await this.checkStreak(userId, 7);
            case BadgeEvent.STREAK_30_DAYS:
                return await this.checkStreak(userId, 30);
            case BadgeEvent.PERSONAL_RECORD:
                return metadata?.isPersonalRecord === true;
            case BadgeEvent.TOTAL_VOLUME_MILESTONE:
                return metadata?.volumeMilestone === true;
            default:
                return false;
        }
    }
    async checkStreak(userId, days) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const completedSessions = await this.prisma.sessionProgress.findMany({
            where: {
                studentId: userId,
                progress: {
                    path: ['completed'],
                    equals: true,
                },
                savedAt: {
                    gte: startDate,
                },
            },
            distinct: ['sessionId'],
        });
        return completedSessions.length >= days / 2;
    }
    async getAllBadges() {
        return this.prisma.badge.findMany({
            orderBy: { id: 'asc' },
        });
    }
    async getUserBadges(userId) {
        return this.prisma.userBadge.findMany({
            where: { userId },
            include: { badge: true },
            orderBy: { awardedAt: 'desc' },
        });
    }
    async getBadgeProgress(userId) {
        const completedSessions = await this.prisma.sessionProgress.count({
            where: {
                studentId: userId,
                progress: {
                    path: ['completed'],
                    equals: true,
                },
            },
        });
        const streak = await this.calculateStreak(userId);
        const maxWeight = await this.getMaxWeight(userId);
        return {
            sessionsCompleted: completedSessions,
            currentStreak: streak,
            maxWeight,
        };
    }
    async calculateStreak(userId) {
        let streak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        for (let i = 0; i < 365; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const completed = await this.prisma.sessionProgress.findFirst({
                where: {
                    studentId: userId,
                    progress: {
                        path: ['completed'],
                        equals: true,
                    },
                    savedAt: {
                        gte: date,
                        lt: new Date(date.getTime() + 24 * 60 * 60 * 1000),
                    },
                },
            });
            if (completed) {
                streak++;
            }
            else if (streak > 0) {
                break;
            }
        }
        return streak;
    }
    async getMaxWeight(userId) {
        const maxSession = await this.prisma.sessionProgress.findFirst({
            where: {
                studentId: userId,
            },
            select: {
                progress: true,
            },
            orderBy: {
                savedAt: 'desc',
            },
        });
        if (!maxSession?.progress) {
            return null;
        }
        const progress = maxSession.progress;
        let maxWeight = 0;
        if (Array.isArray(progress.sets)) {
            progress.sets.forEach((set) => {
                if (set.weight && set.weight > maxWeight) {
                    maxWeight = set.weight;
                }
            });
        }
        return maxWeight > 0 ? maxWeight : null;
    }
};
exports.BadgeService = BadgeService;
exports.BadgeService = BadgeService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BadgeService);
//# sourceMappingURL=badge.service.js.map