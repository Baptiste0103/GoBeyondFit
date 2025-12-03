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
exports.ProgramService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const audit_service_1 = require("./audit.service");
let ProgramService = class ProgramService {
    prisma;
    auditService;
    constructor(prisma, auditService) {
        this.prisma = prisma;
        this.auditService = auditService;
    }
    async createProgram(data, coachId) {
        const { blocks, ...programData } = data;
        try {
            if (blocks && Array.isArray(blocks)) {
                const exerciseIds = new Set();
                for (const block of blocks) {
                    if (block.weeks && Array.isArray(block.weeks)) {
                        for (const week of block.weeks) {
                            if (week.sessions && Array.isArray(week.sessions)) {
                                for (const session of week.sessions) {
                                    if (session.exercises && Array.isArray(session.exercises)) {
                                        for (const exercise of session.exercises) {
                                            if (exercise.exerciseId) {
                                                exerciseIds.add(exercise.exerciseId);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                if (exerciseIds.size > 0) {
                    const existingExercises = await this.prisma.exercise.findMany({
                        where: {
                            id: {
                                in: Array.from(exerciseIds),
                            },
                        },
                        select: { id: true },
                    });
                    const existingIds = new Set(existingExercises.map(e => e.id));
                    const missingIds = Array.from(exerciseIds).filter(id => !existingIds.has(id));
                    if (missingIds.length > 0) {
                        throw new common_1.BadRequestException(`Invalid exercise IDs: ${missingIds.join(', ')}`);
                    }
                }
            }
            const programCreateData = {
                ...programData,
                coachId,
            };
            if (blocks && Array.isArray(blocks) && blocks.length > 0) {
                programCreateData.blocks = {
                    create: blocks.map((block, blockIndex) => {
                        const blockData = {
                            title: block.title || `Block ${blockIndex + 1}`,
                            position: block.position ?? blockIndex,
                        };
                        if (block.notes) {
                            blockData.notes = block.notes;
                        }
                        if (block.weeks && Array.isArray(block.weeks) && block.weeks.length > 0) {
                            blockData.weeks = {
                                create: block.weeks.map((week, weekIndex) => {
                                    const weekData = {
                                        weekNumber: week.weekNumber || weekIndex + 1,
                                        position: week.position ?? weekIndex,
                                    };
                                    if (week.sessions && Array.isArray(week.sessions) && week.sessions.length > 0) {
                                        weekData.sessions = {
                                            create: week.sessions.map((session, sessionIndex) => {
                                                const sessionData = {
                                                    position: session.position ?? sessionIndex,
                                                };
                                                if (session.title) {
                                                    sessionData.title = session.title;
                                                }
                                                if (session.notes) {
                                                    sessionData.notes = session.notes;
                                                }
                                                if (session.date) {
                                                    sessionData.date = session.date;
                                                }
                                                if (session.exercises && Array.isArray(session.exercises) && session.exercises.length > 0) {
                                                    sessionData.exercises = {
                                                        create: session.exercises.map((ex, exIndex) => ({
                                                            exerciseId: ex.exerciseId,
                                                            position: ex.position ?? exIndex,
                                                            ...(ex.config && { config: ex.config }),
                                                        })),
                                                    };
                                                }
                                                return sessionData;
                                            }),
                                        };
                                    }
                                    return weekData;
                                }),
                            };
                        }
                        return blockData;
                    }),
                };
            }
            return this.prisma.program.create({
                data: programCreateData,
                include: {
                    blocks: {
                        include: {
                            weeks: {
                                include: {
                                    sessions: {
                                        include: {
                                            exercises: { include: { exercise: true } },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            }).then(async (program) => {
                await this.auditService.logChange(program.id, coachId, 'create', { title: program.title, description: program.description, isDraft: program.isDraft });
                return program;
            });
        }
        catch (error) {
            console.error('CREATE_PROGRAM_ERROR:', error);
            const message = error?.message || 'Unknown error';
            if (error?.code === 'P2003') {
                throw new common_1.BadRequestException('Invalid exercise ID in program structure: ' + message);
            }
            if (error?.code === 'P2002') {
                throw new common_1.BadRequestException('Duplicate entry in program structure: ' + message);
            }
            throw new common_1.BadRequestException('Failed to create program: ' + message);
        }
    }
    async findByCoach(coachId) {
        return this.prisma.program.findMany({
            where: { coachId },
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
                assignments: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findById(id, userId) {
        const program = await this.prisma.program.findUnique({
            where: { id },
            include: {
                coach: { select: { id: true, pseudo: true, email: true } },
                blocks: {
                    orderBy: { position: 'asc' },
                    include: {
                        weeks: {
                            orderBy: { position: 'asc' },
                            include: {
                                sessions: {
                                    orderBy: { position: 'asc' },
                                    include: {
                                        exercises: {
                                            orderBy: { position: 'asc' },
                                            include: { exercise: true },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                assignments: true,
            },
        });
        if (!program) {
            throw new common_1.NotFoundException(`Program not found`);
        }
        const isOwner = program.coachId === userId;
        const isAssigned = program.assignments.some(a => a.studentId === userId);
        if (!isOwner && !isAssigned) {
            throw new common_1.ForbiddenException('Access denied to this program');
        }
        return program;
    }
    async findAll() {
        return this.prisma.program.findMany({
            include: {
                coach: true,
                blocks: true,
                assignments: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async update(id, data, coachId) {
        const program = await this.prisma.program.findUnique({ where: { id } });
        if (!program) {
            throw new common_1.NotFoundException('Program not found');
        }
        if (program.coachId !== coachId) {
            throw new common_1.ForbiddenException('Only the coach can update this program');
        }
        const { blocks, ...programData } = data;
        if (blocks && Array.isArray(blocks)) {
            await this.prisma.programBlock.deleteMany({
                where: { programId: id },
            });
            await this.prisma.program.update({
                where: { id },
                data: programData,
            });
            for (const block of blocks) {
                const createdBlock = await this.prisma.programBlock.create({
                    data: {
                        programId: id,
                        title: block.title || `Block`,
                        position: block.position ?? 0,
                        notes: block.notes,
                    },
                });
                if (block.weeks && Array.isArray(block.weeks)) {
                    for (const week of block.weeks) {
                        const createdWeek = await this.prisma.week.create({
                            data: {
                                blockId: createdBlock.id,
                                weekNumber: week.weekNumber || 1,
                                position: week.position ?? 0,
                            },
                        });
                        if (week.sessions && Array.isArray(week.sessions)) {
                            for (const session of week.sessions) {
                                const createdSession = await this.prisma.session.create({
                                    data: {
                                        weekId: createdWeek.id,
                                        title: session.title,
                                        notes: session.notes,
                                        date: session.date,
                                        position: session.position ?? 0,
                                    },
                                });
                                if (session.exercises && Array.isArray(session.exercises)) {
                                    for (const exercise of session.exercises) {
                                        const configData = (exercise.weight || exercise.reps || exercise.sets || exercise.format || exercise.duration || exercise.notes)
                                            ? {
                                                weight: exercise.weight,
                                                reps: exercise.reps,
                                                sets: exercise.sets,
                                                format: exercise.format,
                                                duration: exercise.duration,
                                                notes: exercise.notes,
                                            }
                                            : undefined;
                                        await this.prisma.sessionExercise.create({
                                            data: {
                                                sessionId: createdSession.id,
                                                exerciseId: exercise.exerciseId,
                                                position: exercise.position ?? 0,
                                                ...(configData && { config: configData }),
                                            },
                                        });
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        else {
            await this.prisma.program.update({
                where: { id },
                data: programData,
            });
        }
        const diff = this.auditService.calculateDiff(program, data);
        await this.auditService.logChange(id, coachId, 'update', diff);
        return this.findById(id, coachId);
    }
    async delete(id, coachId) {
        const program = await this.prisma.program.findUnique({ where: { id } });
        if (!program) {
            throw new common_1.NotFoundException('Program not found');
        }
        if (program.coachId !== coachId) {
            throw new common_1.ForbiddenException('Only the coach can delete this program');
        }
        await this.auditService.logChange(id, coachId, 'delete', { title: program.title, description: program.description });
        return this.prisma.program.delete({ where: { id } });
    }
    async getAssignedPrograms(studentId) {
        return this.prisma.program.findMany({
            where: {
                assignments: {
                    some: {
                        studentId,
                    },
                },
            },
            include: {
                blocks: {
                    include: {
                        weeks: {
                            include: {
                                sessions: {
                                    include: {
                                        exercises: { include: { exercise: true } },
                                    },
                                },
                            },
                        },
                    },
                },
                coach: { select: { pseudo: true, email: true } },
            },
        });
    }
    async assignToStudent(programId, studentId, coachId) {
        const program = await this.prisma.program.findUnique({ where: { id: programId } });
        if (!program) {
            throw new common_1.NotFoundException('Program not found');
        }
        if (program.coachId !== coachId) {
            throw new common_1.ForbiddenException('Only the coach can assign programs');
        }
        const existing = await this.prisma.programAssignment.findFirst({
            where: { programId, studentId },
        });
        if (existing) {
            return existing;
        }
        const assignment = await this.prisma.programAssignment.create({
            data: {
                programId,
                studentId,
                assignedBy: coachId,
            },
        });
        await this.auditService.logChange(programId, coachId, 'assign', { studentId, assignmentId: assignment.id });
        return assignment;
    }
    async removeAssignment(assignmentId, coachId) {
        const assignment = await this.prisma.programAssignment.findUnique({
            where: { id: assignmentId },
            include: { program: true },
        });
        if (!assignment) {
            throw new common_1.NotFoundException('Assignment not found');
        }
        if (assignment.program.coachId !== coachId) {
            throw new common_1.ForbiddenException('Only the coach can remove assignments');
        }
        const result = await this.prisma.programAssignment.delete({ where: { id: assignmentId } });
        await this.auditService.logChange(assignment.programId, coachId, 'unassign', { studentId: assignment.studentId, assignmentId });
        return result;
    }
    async getAuditLog(programId, coachId) {
        const program = await this.prisma.program.findUnique({ where: { id: programId } });
        if (!program) {
            throw new common_1.NotFoundException('Program not found');
        }
        if (program.coachId !== coachId) {
            throw new common_1.ForbiddenException('Only the coach can view audit logs');
        }
        return this.auditService.getAuditLog(programId);
    }
};
exports.ProgramService = ProgramService;
exports.ProgramService = ProgramService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService])
], ProgramService);
//# sourceMappingURL=program.service.js.map