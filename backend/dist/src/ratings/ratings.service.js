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
exports.RatingsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let RatingsService = class RatingsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createOrUpdateRating(exerciseId, userId, dto) {
        const exercise = await this.prisma.exercise.findUnique({
            where: { id: exerciseId },
        });
        if (!exercise) {
            throw new common_1.NotFoundException('Exercise not found');
        }
        const rating = await this.prisma.exerciseRating.upsert({
            where: {
                exerciseId_userId: {
                    exerciseId,
                    userId,
                },
            },
            update: {
                rating: dto.rating,
                comment: dto.comment || null,
            },
            create: {
                exerciseId,
                userId,
                rating: dto.rating,
                comment: dto.comment,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        pseudo: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });
        return this.formatRating(rating);
    }
    async getExerciseRatings(exerciseId, userId) {
        const exercise = await this.prisma.exercise.findUnique({
            where: { id: exerciseId },
        });
        if (!exercise) {
            throw new common_1.NotFoundException('Exercise not found');
        }
        const ratings = await this.prisma.exerciseRating.findMany({
            where: { exerciseId },
            include: {
                user: {
                    select: {
                        id: true,
                        pseudo: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        const totalRatings = ratings.length;
        const averageRating = totalRatings > 0
            ? ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings
            : 0;
        const userRating = ratings.find((r) => r.userId === userId);
        const distribution = {
            5: ratings.filter((r) => r.rating === 5).length,
            4: ratings.filter((r) => r.rating === 4).length,
            3: ratings.filter((r) => r.rating === 3).length,
            2: ratings.filter((r) => r.rating === 2).length,
            1: ratings.filter((r) => r.rating === 1).length,
        };
        return {
            exerciseId,
            totalRatings,
            averageRating: Math.round(averageRating * 10) / 10,
            distribution,
            userRating: userRating ? this.formatRating(userRating) : null,
            recentRatings: ratings.slice(0, 10).map((r) => this.formatRating(r)),
        };
    }
    async getUserRating(exerciseId, userId) {
        const rating = await this.prisma.exerciseRating.findUnique({
            where: {
                exerciseId_userId: {
                    exerciseId,
                    userId,
                },
            },
            include: {
                user: {
                    select: {
                        id: true,
                        pseudo: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });
        if (!rating) {
            return null;
        }
        return this.formatRating(rating);
    }
    async updateRating(ratingId, userId, exerciseId, dto) {
        const rating = await this.prisma.exerciseRating.findUnique({
            where: { id: ratingId },
        });
        if (!rating) {
            throw new common_1.NotFoundException('Rating not found');
        }
        if (rating.userId !== userId) {
            throw new common_1.ForbiddenException('You can only update your own ratings');
        }
        if (rating.exerciseId !== exerciseId) {
            throw new common_1.BadRequestException('Rating does not belong to this exercise');
        }
        const updated = await this.prisma.exerciseRating.update({
            where: { id: ratingId },
            data: {
                rating: dto.rating ?? rating.rating,
                comment: dto.comment !== undefined ? dto.comment : rating.comment,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        pseudo: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });
        return this.formatRating(updated);
    }
    async deleteRating(ratingId, userId, exerciseId) {
        const rating = await this.prisma.exerciseRating.findUnique({
            where: { id: ratingId },
        });
        if (!rating) {
            throw new common_1.NotFoundException('Rating not found');
        }
        if (rating.userId !== userId) {
            throw new common_1.ForbiddenException('You can only delete your own ratings');
        }
        if (rating.exerciseId !== exerciseId) {
            throw new common_1.BadRequestException('Rating does not belong to this exercise');
        }
        await this.prisma.exerciseRating.delete({
            where: { id: ratingId },
        });
        return { success: true, message: 'Rating deleted successfully' };
    }
    formatRating(rating) {
        return {
            id: rating.id,
            exerciseId: rating.exerciseId,
            rating: rating.rating,
            comment: rating.comment,
            createdAt: rating.createdAt,
            updatedAt: rating.updatedAt,
            user: rating.user || null,
        };
    }
};
exports.RatingsService = RatingsService;
exports.RatingsService = RatingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RatingsService);
//# sourceMappingURL=ratings.service.js.map