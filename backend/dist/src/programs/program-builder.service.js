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
exports.ProgramBuilderService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ProgramBuilderService = class ProgramBuilderService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async filterExercises(options, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const whereClause = {};
        if (options.difficulty) {
            whereClause.meta = whereClause.meta || {};
            whereClause.meta.path = ['difficulty'];
            whereClause.meta.equals = options.difficulty;
        }
        if (options.muscleGroups && options.muscleGroups.length > 0) {
            whereClause.meta = whereClause.meta || {};
            whereClause.meta.path = ['muscleGroups'];
            whereClause.meta.hasSome = options.muscleGroups;
        }
        if (options.searchQuery) {
            whereClause.OR = [
                { name: { contains: options.searchQuery, mode: 'insensitive' } },
                { description: { contains: options.searchQuery, mode: 'insensitive' } },
            ];
        }
        if (options.excludeExercises && options.excludeExercises.length > 0) {
            whereClause.id = { notIn: options.excludeExercises };
        }
        const [exercises, total] = await Promise.all([
            this.prisma.exercise.findMany({
                where: whereClause,
                select: {
                    id: true,
                    name: true,
                    description: true,
                    meta: true,
                },
                orderBy: { name: 'asc' },
                skip,
                take: limit,
            }),
            this.prisma.exercise.count({ where: whereClause }),
        ]);
        return {
            data: exercises,
            total,
            page,
            limit,
            pages: Math.ceil(total / limit),
        };
    }
    checkDuplicates(exercises) {
        const exerciseMap = new Map();
        const flattenExercises = (items, position = []) => {
            items.forEach((item, index) => {
                const currentPosition = [...position, index];
                if (item.exerciseId) {
                    if (!exerciseMap.has(item.exerciseId)) {
                        exerciseMap.set(item.exerciseId, []);
                    }
                    exerciseMap.get(item.exerciseId).push(parseInt(currentPosition.join('.')));
                }
                if (item.exercises && Array.isArray(item.exercises)) {
                    flattenExercises(item.exercises, currentPosition);
                }
                else if (item.sessions && Array.isArray(item.sessions)) {
                    flattenExercises(item.sessions, currentPosition);
                }
                else if (item.weeks && Array.isArray(item.weeks)) {
                    flattenExercises(item.weeks, currentPosition);
                }
                else if (item.blocks && Array.isArray(item.blocks)) {
                    flattenExercises(item.blocks, currentPosition);
                }
            });
        };
        flattenExercises(exercises);
        const duplicates = [];
        let hasDuplicates = false;
        exerciseMap.forEach((positions, exerciseId) => {
            if (positions.length > 1) {
                hasDuplicates = true;
                duplicates.push({
                    exerciseId,
                    exerciseName: '',
                    count: positions.length,
                    positions,
                });
            }
        });
        return {
            hasDuplicates,
            duplicates,
        };
    }
    async getExercisesWithDetails(exerciseIds) {
        const exercises = await this.prisma.exercise.findMany({
            where: { id: { in: exerciseIds } },
            select: {
                id: true,
                name: true,
                description: true,
                meta: true,
            },
        });
        const map = new Map();
        exercises.forEach((ex) => {
            map.set(ex.id, ex);
        });
        return map;
    }
    async validateProgram(programData) {
        const errors = [];
        if (!programData.title) {
            errors.push('Program title is required');
        }
        if (!programData.title || programData.title.length < 3) {
            errors.push('Program title must be at least 3 characters');
        }
        if (!programData.blocks || !Array.isArray(programData.blocks)) {
            errors.push('Program must have at least one block');
        }
        if (programData.blocks && programData.blocks.length === 0) {
            errors.push('Program must have at least one block');
        }
        if (programData.blocks && Array.isArray(programData.blocks)) {
            programData.blocks.forEach((block, blockIndex) => {
                if (!block.title) {
                    errors.push(`Block ${blockIndex + 1}: title is required`);
                }
                if (!block.weeks || !Array.isArray(block.weeks) || block.weeks.length === 0) {
                    errors.push(`Block "${block.title}": must have at least one week`);
                }
                block.weeks?.forEach((week, weekIndex) => {
                    if (!week.sessions || !Array.isArray(week.sessions) || week.sessions.length === 0) {
                        errors.push(`Week ${week.weekNumber || weekIndex + 1}: must have at least one session`);
                    }
                    week.sessions?.forEach((session, sessionIndex) => {
                        if (!session.title) {
                            errors.push(`Session ${sessionIndex + 1}: title is required`);
                        }
                        if (!session.exercises || !Array.isArray(session.exercises)) {
                            errors.push(`Session "${session.title}": must have exercises array`);
                        }
                        session.exercises?.forEach((exercise, exerciseIndex) => {
                            if (!exercise.exerciseId) {
                                errors.push(`Session "${session.title}", Exercise ${exerciseIndex + 1}: exerciseId is required`);
                            }
                        });
                    });
                });
            });
        }
        return {
            isValid: errors.length === 0,
            errors,
        };
    }
    async cloneProgram(userId, originalProgramId, newTitle) {
        const original = await this.prisma.program.findUnique({
            where: { id: originalProgramId },
        });
        if (!original) {
            throw new common_1.NotFoundException('Program not found');
        }
        if (original.ownerId !== userId) {
            throw new common_1.BadRequestException('Cannot clone program you do not own');
        }
        return this.prisma.program.create({
            data: {
                title: newTitle,
                description: original.description,
                coachId: userId,
                ownerId: userId,
                isDraft: true,
                data: original.data || {},
            },
        });
    }
    async getProgramStats(programId) {
        const program = await this.prisma.program.findUnique({
            where: { id: programId },
        });
        if (!program) {
            throw new common_1.NotFoundException('Program not found');
        }
        let exerciseCount = 0;
        let blockCount = 0;
        let weekCount = 0;
        let sessionCount = 0;
        const data = program.data;
        if (data.blocks && Array.isArray(data.blocks)) {
            blockCount = data.blocks.length;
            data.blocks.forEach((block) => {
                if (block.weeks && Array.isArray(block.weeks)) {
                    weekCount += block.weeks.length;
                    block.weeks.forEach((week) => {
                        if (week.sessions && Array.isArray(week.sessions)) {
                            sessionCount += week.sessions.length;
                            week.sessions.forEach((session) => {
                                if (session.exercises && Array.isArray(session.exercises)) {
                                    exerciseCount += session.exercises.length;
                                }
                            });
                        }
                    });
                }
            });
        }
        return {
            programId,
            title: program.title,
            exerciseCount,
            blockCount,
            weekCount,
            sessionCount,
            estimatedDuration: `${weekCount} weeks`,
        };
    }
    async saveProgram(userId, programId, saveData) {
        if (!saveData.title || saveData.title.trim().length < 3) {
            throw new common_1.BadRequestException('Program title must be at least 3 characters');
        }
        const program = await this.prisma.program.findUnique({
            where: { id: programId },
        });
        if (!program) {
            throw new common_1.NotFoundException('Program not found');
        }
        if (program.ownerId !== userId && program.coachId !== userId) {
            throw new common_1.BadRequestException('You do not have permission to edit this program');
        }
        await this.prisma.programBlock.deleteMany({
            where: { programId },
        });
        let position = 0;
        for (const blockData of saveData.blocks || []) {
            const block = await this.prisma.programBlock.create({
                data: {
                    programId,
                    title: blockData.title || `Block ${position + 1}`,
                    position: position,
                    notes: blockData.notes,
                },
            });
            let weekPosition = 0;
            for (const weekData of blockData.weeks || []) {
                const week = await this.prisma.week.create({
                    data: {
                        blockId: block.id,
                        weekNumber: weekData.weekNumber || weekPosition + 1,
                        position: weekPosition,
                    },
                });
                let sessionPosition = 0;
                for (const sessionData of weekData.sessions || []) {
                    const session = await this.prisma.session.create({
                        data: {
                            weekId: week.id,
                            title: sessionData.title || `Session ${sessionPosition + 1}`,
                            position: sessionPosition,
                            date: sessionData.date,
                            notes: sessionData.notes,
                        },
                    });
                    let exercisePosition = 0;
                    for (const exerciseData of sessionData.exercises || []) {
                        if (!exerciseData.exerciseId) {
                            console.warn('Exercise missing exerciseId, skipping', exerciseData);
                            continue;
                        }
                        const exercise = await this.prisma.exercise.findUnique({
                            where: { id: exerciseData.exerciseId },
                        });
                        if (!exercise) {
                            console.warn(`Exercise ${exerciseData.exerciseId} not found, skipping`);
                            continue;
                        }
                        await this.prisma.sessionExercise.create({
                            data: {
                                sessionId: session.id,
                                exerciseId: exerciseData.exerciseId,
                                position: exercisePosition,
                                config: exerciseData.config || {},
                            },
                        });
                        exercisePosition++;
                    }
                    sessionPosition++;
                }
                weekPosition++;
            }
            position++;
        }
        return this.prisma.program.update({
            where: { id: programId },
            data: {
                title: saveData.title,
                description: saveData.description || program.description,
                isDraft: saveData.isDraft ?? true,
                updatedAt: new Date(),
            },
            include: {
                blocks: {
                    include: {
                        weeks: {
                            include: {
                                sessions: {
                                    include: {
                                        exercises: {
                                            include: {
                                                exercise: true,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
    }
    async getProgramDetails(programId, userId) {
        const program = await this.prisma.program.findUnique({
            where: { id: programId },
            include: {
                assignments: true,
                blocks: {
                    include: {
                        weeks: {
                            include: {
                                sessions: {
                                    include: {
                                        exercises: {
                                            include: {
                                                exercise: true,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
        if (!program) {
            throw new common_1.NotFoundException('Program not found');
        }
        const isCoach = program.coachId === userId || program.ownerId === userId;
        const isAssigned = program.assignments?.some(a => a.studentId === userId);
        if (!isCoach && !isAssigned) {
            throw new common_1.ForbiddenException('You do not have permission to view this program');
        }
        return {
            id: program.id,
            title: program.title,
            description: program.description,
            isDraft: program.isDraft,
            blocks: program.blocks || [],
            ownerId: program.ownerId,
            coachId: program.coachId,
            createdAt: program.createdAt,
            updatedAt: program.updatedAt,
        };
    }
};
exports.ProgramBuilderService = ProgramBuilderService;
exports.ProgramBuilderService = ProgramBuilderService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProgramBuilderService);
//# sourceMappingURL=program-builder.service.js.map