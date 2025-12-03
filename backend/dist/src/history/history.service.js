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
exports.HistoryService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let HistoryService = class HistoryService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async logView(userId, dto) {
        const exercise = await this.prisma.exercise.findUnique({
            where: { id: dto.exerciseId },
        });
        if (!exercise) {
            throw new common_1.NotFoundException(`Exercise with ID ${dto.exerciseId} not found`);
        }
        const history = await this.prisma.exerciseHistory.create({
            data: {
                userId,
                exerciseId: dto.exerciseId,
                viewedAt: new Date(),
            },
            include: {
                exercise: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                        meta: true,
                    },
                },
            },
        });
        await this.cleanupOldHistory(userId, 50);
        return history;
    }
    async getUserHistory(userId, page, limit, from, to) {
        const skip = (page - 1) * limit;
        const whereClause = { userId };
        if (from || to) {
            whereClause.viewedAt = {};
            if (from)
                whereClause.viewedAt.gte = new Date(from);
            if (to)
                whereClause.viewedAt.lte = new Date(to);
        }
        const [history, total] = await Promise.all([
            this.prisma.exerciseHistory.findMany({
                where: whereClause,
                include: {
                    exercise: {
                        select: {
                            id: true,
                            name: true,
                            description: true,
                            meta: true,
                        },
                    },
                },
                orderBy: { viewedAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.exerciseHistory.count({ where: whereClause }),
        ]);
        return {
            data: history,
            total,
            page,
            limit,
            pages: Math.ceil(total / limit),
        };
    }
    async getRecentlyViewed(userId, limit = 8) {
        const recentHistory = await this.prisma.exerciseHistory.findMany({
            where: { userId },
            include: {
                exercise: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                        meta: true,
                    },
                },
            },
            orderBy: { viewedAt: 'desc' },
            take: limit * 2,
        });
        const seen = new Set();
        const unique = recentHistory.filter((item) => {
            if (seen.has(item.exerciseId))
                return false;
            seen.add(item.exerciseId);
            return true;
        });
        return unique.slice(0, limit);
    }
    async clearHistory(userId) {
        const deleted = await this.prisma.exerciseHistory.deleteMany({
            where: { userId },
        });
        return {
            deletedCount: deleted.count,
            message: `Deleted ${deleted.count} history entries`,
        };
    }
    async deleteHistoryEntry(userId, historyId) {
        const entry = await this.prisma.exerciseHistory.findUnique({
            where: { id: historyId },
        });
        if (!entry) {
            throw new common_1.NotFoundException(`History entry ${historyId} not found`);
        }
        if (entry.userId !== userId) {
            throw new common_1.NotFoundException('History entry not found');
        }
        await this.prisma.exerciseHistory.delete({
            where: { id: historyId },
        });
        return { message: 'History entry deleted' };
    }
    async cleanupOldHistory(userId, keepCount) {
        const userHistory = await this.prisma.exerciseHistory.findMany({
            where: { userId },
            orderBy: { viewedAt: 'desc' },
            select: { id: true },
        });
        if (userHistory.length > keepCount) {
            const toDelete = userHistory.slice(keepCount).map((h) => h.id);
            await this.prisma.exerciseHistory.deleteMany({
                where: { id: { in: toDelete } },
            });
        }
    }
    async getExerciseViewCount(exerciseId) {
        const count = await this.prisma.exerciseHistory.count({
            where: { exerciseId },
        });
        return { exerciseId, viewCount: count };
    }
    async getExerciseUniqueViewCount(exerciseId) {
        const count = await this.prisma.exerciseHistory.findMany({
            where: { exerciseId },
            distinct: ['userId'],
            select: { userId: true },
        });
        return { exerciseId, uniqueUserCount: count.length };
    }
};
exports.HistoryService = HistoryService;
exports.HistoryService = HistoryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], HistoryService);
//# sourceMappingURL=history.service.js.map