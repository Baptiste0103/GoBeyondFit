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
exports.FavoritesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let FavoritesService = class FavoritesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async addFavorite(userId, exerciseId) {
        const exercise = await this.prisma.exercise.findUnique({
            where: { id: exerciseId },
            include: {
                owner: {
                    select: {
                        id: true,
                        pseudo: true,
                    },
                },
            },
        });
        if (!exercise) {
            throw new common_1.NotFoundException('Exercise not found');
        }
        const existing = await this.prisma.favoriteExercise.findUnique({
            where: {
                userId_exerciseId: {
                    userId,
                    exerciseId,
                },
            },
        });
        if (existing) {
            throw new common_1.ConflictException('Exercise already in favorites');
        }
        const favorite = await this.prisma.favoriteExercise.create({
            data: {
                userId,
                exerciseId,
            },
            include: {
                exercise: {
                    include: {
                        owner: {
                            select: {
                                id: true,
                                pseudo: true,
                            },
                        },
                    },
                },
            },
        });
        return {
            id: favorite.id,
            exercise: this.formatExercise(favorite.exercise),
            addedAt: favorite.addedAt,
        };
    }
    async removeFavorite(userId, exerciseId) {
        const exercise = await this.prisma.exercise.findUnique({
            where: { id: exerciseId },
        });
        if (!exercise) {
            throw new common_1.NotFoundException('Exercise not found');
        }
        const favorite = await this.prisma.favoriteExercise.findUnique({
            where: {
                userId_exerciseId: {
                    userId,
                    exerciseId,
                },
            },
        });
        if (!favorite) {
            throw new common_1.NotFoundException('Exercise not in favorites');
        }
        await this.prisma.favoriteExercise.delete({
            where: {
                userId_exerciseId: {
                    userId,
                    exerciseId,
                },
            },
        });
        return { success: true, message: 'Removed from favorites' };
    }
    async getUserFavorites(userId, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const total = await this.prisma.favoriteExercise.count({
            where: { userId },
        });
        const favorites = await this.prisma.favoriteExercise.findMany({
            where: { userId },
            include: {
                exercise: {
                    include: {
                        owner: {
                            select: {
                                id: true,
                                pseudo: true,
                            },
                        },
                    },
                },
            },
            orderBy: { addedAt: 'desc' },
            skip,
            take: limit,
        });
        return {
            data: favorites.map((fav) => ({
                id: fav.id,
                exercise: this.formatExercise(fav.exercise),
                addedAt: fav.addedAt,
            })),
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async isFavorite(userId, exerciseId) {
        const favorite = await this.prisma.favoriteExercise.findUnique({
            where: {
                userId_exerciseId: {
                    userId,
                    exerciseId,
                },
            },
        });
        return !!favorite;
    }
    async getFavoriteIds(userId) {
        const favorites = await this.prisma.favoriteExercise.findMany({
            where: { userId },
            select: { exerciseId: true },
        });
        return favorites.map((fav) => fav.exerciseId);
    }
    formatExercise(exercise) {
        return {
            id: exercise.id,
            name: exercise.name,
            description: exercise.description,
            scope: exercise.scope,
            meta: exercise.meta,
            owner: exercise.owner,
        };
    }
};
exports.FavoritesService = FavoritesService;
exports.FavoritesService = FavoritesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FavoritesService);
//# sourceMappingURL=favorites.service.js.map