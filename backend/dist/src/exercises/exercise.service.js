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
exports.ExerciseService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ExerciseService = class ExerciseService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createExerciseDto, userId) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user || (user.role !== 'coach' && user.role !== 'admin')) {
            throw new common_1.ForbiddenException('Only coaches can create exercises');
        }
        const scope = createExerciseDto.scope || 'coach';
        if (scope === 'global' && user.role !== 'admin') {
            throw new common_1.ForbiddenException('Only admins can create global exercises');
        }
        const meta = {
            ...(createExerciseDto.meta || {}),
            difficulty: createExerciseDto.difficulty || 'Beginner',
            muscleGroups: createExerciseDto.muscleGroups || [],
            instructions: createExerciseDto.instructions || [],
            videoUrl: createExerciseDto.videoUrl || null,
            sets: createExerciseDto.sets || 3,
            reps: createExerciseDto.reps || 12,
        };
        return this.prisma.exercise.create({
            data: {
                name: createExerciseDto.name,
                description: createExerciseDto.description,
                type: createExerciseDto.type || 'standard',
                scope,
                meta,
                ownerId: scope === 'global' ? null : userId,
            },
            include: {
                owner: {
                    select: { id: true, pseudo: true, firstName: true, lastName: true },
                },
            },
        });
    }
    async findAll(userId) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const exercises = await this.prisma.exercise.findMany({
            where: {
                OR: [
                    { scope: 'global' },
                    { ownerId: userId },
                    ...(user.role === 'student' && user.coachId
                        ? [{ ownerId: user.coachId }]
                        : []),
                ],
            },
            include: {
                owner: {
                    select: { id: true, pseudo: true, firstName: true, lastName: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        return exercises.map((exercise) => ({
            ...exercise,
            ...exercise.meta,
        }));
    }
    async findOne(id, userId) {
        const exercise = await this.prisma.exercise.findUnique({
            where: { id },
            include: {
                owner: {
                    select: { id: true, pseudo: true, firstName: true, lastName: true },
                },
            },
        });
        if (!exercise) {
            throw new common_1.NotFoundException('Exercise not found');
        }
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (exercise.scope === 'global') {
            return { ...exercise, ...exercise.meta };
        }
        if (exercise.ownerId === userId) {
            return { ...exercise, ...exercise.meta };
        }
        if (user.role === 'student' && exercise.ownerId === user.coachId) {
            return { ...exercise, ...exercise.meta };
        }
        throw new common_1.ForbiddenException('You do not have permission to view this exercise');
    }
    async update(id, updateExerciseDto, userId) {
        const exercise = await this.prisma.exercise.findUnique({ where: { id } });
        if (!exercise) {
            throw new common_1.NotFoundException('Exercise not found');
        }
        if (exercise.ownerId !== userId) {
            const user = await this.prisma.user.findUnique({ where: { id: userId } });
            if (!user || user.role !== 'admin') {
                throw new common_1.ForbiddenException('You can only update your own exercises');
            }
        }
        const updateData = {
            name: updateExerciseDto.name,
            description: updateExerciseDto.description,
            type: updateExerciseDto.type,
            scope: updateExerciseDto.scope,
        };
        if (updateExerciseDto.difficulty ||
            updateExerciseDto.muscleGroups ||
            updateExerciseDto.instructions ||
            updateExerciseDto.videoUrl ||
            updateExerciseDto.sets ||
            updateExerciseDto.reps) {
            const currentMeta = exercise.meta || {};
            updateData.meta = {
                ...currentMeta,
                ...(updateExerciseDto.difficulty && { difficulty: updateExerciseDto.difficulty }),
                ...(updateExerciseDto.muscleGroups && { muscleGroups: updateExerciseDto.muscleGroups }),
                ...(updateExerciseDto.instructions && { instructions: updateExerciseDto.instructions }),
                ...(updateExerciseDto.videoUrl && { videoUrl: updateExerciseDto.videoUrl }),
                ...(updateExerciseDto.sets && { sets: updateExerciseDto.sets }),
                ...(updateExerciseDto.reps && { reps: updateExerciseDto.reps }),
            };
        }
        return this.prisma.exercise.update({
            where: { id },
            data: updateData,
            include: {
                owner: {
                    select: { id: true, pseudo: true, firstName: true, lastName: true },
                },
            },
        });
    }
    async remove(id, userId) {
        const exercise = await this.prisma.exercise.findUnique({ where: { id } });
        if (!exercise) {
            throw new common_1.NotFoundException('Exercise not found');
        }
        if (exercise.ownerId !== userId) {
            const user = await this.prisma.user.findUnique({ where: { id: userId } });
            if (!user || user.role !== 'admin') {
                throw new common_1.ForbiddenException('You can only delete your own exercises');
            }
        }
        return this.prisma.exercise.delete({ where: { id } });
    }
    async searchLibrary(options) {
        const { search, difficulty, muscleGroup, page, limit, userId } = options;
        const skip = (page - 1) * limit;
        const where = {
            OR: [
                { scope: 'global' },
                { ownerId: userId },
            ],
        };
        if (search && search.trim()) {
            where.AND = where.AND || [];
            where.AND.push({
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } },
                ],
            });
        }
        if (difficulty) {
            where.AND = where.AND || [];
            where.AND.push({
                meta: {
                    path: ['difficultyLevel'],
                    equals: difficulty,
                },
            });
        }
        if (muscleGroup) {
            where.AND = where.AND || [];
            where.AND.push({
                meta: {
                    path: ['targetMuscleGroup'],
                    equals: muscleGroup,
                },
            });
        }
        const total = await this.prisma.exercise.count({ where });
        const exercises = await this.prisma.exercise.findMany({
            where,
            include: {
                owner: {
                    select: { id: true, pseudo: true, firstName: true, lastName: true },
                },
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
        });
        return {
            data: exercises,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async getCoachExercises(userId, options = {}) {
        const { page = 1, limit = 20, search = '' } = options;
        const skip = (page - 1) * limit;
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user || user.role !== 'coach') {
            throw new common_1.ForbiddenException('Only coaches can view their created exercises');
        }
        const where = { ownerId: userId };
        if (search && search.trim()) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }
        const total = await this.prisma.exercise.count({ where });
        const data = await this.prisma.exercise.findMany({
            where,
            include: {
                owner: {
                    select: { id: true, pseudo: true, firstName: true, lastName: true },
                },
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
        });
        const transformedData = data.map((exercise) => ({
            ...exercise,
            ...exercise.meta,
        }));
        return {
            data: transformedData,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
};
exports.ExerciseService = ExerciseService;
exports.ExerciseService = ExerciseService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ExerciseService);
//# sourceMappingURL=exercise.service.js.map