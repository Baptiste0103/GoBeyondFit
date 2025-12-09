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
exports.SessionService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let SessionService = class SessionService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getStudentSessions(studentId, from, to) {
        const assignments = await this.prisma.programAssignment.findMany({
            where: { studentId },
            select: { programId: true },
        });
        const programIds = assignments.map(a => a.programId);
        if (programIds.length === 0) {
            return [];
        }
        let dateFilter = {};
        if (from || to) {
            dateFilter = {
                date: {
                    ...(from && { gte: new Date(from) }),
                    ...(to && { lte: new Date(to) }),
                },
            };
        }
        return this.prisma.session.findMany({
            where: {
                week: {
                    block: {
                        programId: { in: programIds },
                    },
                },
                ...dateFilter,
            },
            include: {
                exercises: {
                    include: { exercise: true },
                    orderBy: { position: 'asc' },
                },
                week: {
                    select: {
                        blockId: true,
                        weekNumber: true,
                        block: {
                            select: { programId: true, title: true },
                        },
                    },
                },
            },
            orderBy: { date: 'desc' },
        });
    }
    async getSessionDetails(sessionId, studentId) {
        const session = await this.prisma.session.findUnique({
            where: { id: sessionId },
            include: {
                exercises: {
                    include: { exercise: true },
                    orderBy: { position: 'asc' },
                },
                week: {
                    select: {
                        block: {
                            select: { programId: true, title: true },
                        },
                    },
                },
            },
        });
        if (!session) {
            throw new common_1.NotFoundException('Session not found');
        }
        const program = session.week.block;
        const assignment = await this.prisma.programAssignment.findFirst({
            where: {
                studentId,
                programId: program.programId,
            },
        });
        if (!assignment) {
            throw new common_1.ForbiddenException('Access denied to this session');
        }
        return session;
    }
    async saveProgress(sessionId, studentId, progressData) {
        const session = await this.prisma.session.findUnique({
            where: { id: sessionId },
            include: { week: { select: { block: { select: { programId: true } } } } },
        });
        if (!session) {
            throw new common_1.NotFoundException('Session not found');
        }
        const assignment = await this.prisma.programAssignment.findFirst({
            where: {
                studentId,
                programId: session.week.block.programId,
            },
        });
        if (!assignment) {
            throw new common_1.ForbiddenException('Access denied to this session');
        }
        let existingProgress = await this.prisma.sessionProgress.findFirst({
            where: {
                sessionId,
                studentId,
            },
        });
        if (existingProgress) {
            return this.prisma.sessionProgress.update({
                where: { id: existingProgress.id },
                data: {
                    progress: progressData.progress,
                    notes: progressData.notes,
                    videos: progressData.videos || [],
                    updatedAt: new Date(),
                },
            });
        }
        else {
            return this.prisma.sessionProgress.create({
                data: {
                    sessionId,
                    studentId,
                    progress: progressData.progress,
                    notes: progressData.notes,
                    videos: progressData.videos || [],
                },
            });
        }
    }
    async getStudentProgress(sessionId, studentId) {
        const session = await this.prisma.session.findUnique({
            where: { id: sessionId },
            include: { week: { select: { block: { select: { programId: true } } } } },
        });
        if (!session) {
            throw new common_1.NotFoundException('Session not found');
        }
        const assignment = await this.prisma.programAssignment.findFirst({
            where: {
                studentId,
                programId: session.week.block.programId,
            },
        });
        if (!assignment) {
            throw new common_1.ForbiddenException('Access denied');
        }
        return this.prisma.sessionProgress.findMany({
            where: { sessionId, studentId },
        });
    }
    async addExerciseToSession(sessionId, exerciseId, coachId, config) {
        const session = await this.prisma.session.findUnique({
            where: { id: sessionId },
            include: {
                week: {
                    select: {
                        block: {
                            select: { programId: true, program: { select: { coachId: true } } },
                        },
                    },
                },
            },
        });
        if (!session) {
            throw new common_1.NotFoundException('Session not found');
        }
        if (session.week.block.program.coachId !== coachId) {
            throw new common_1.ForbiddenException('You can only add exercises to your own sessions');
        }
        const exercise = await this.prisma.exercise.findUnique({
            where: { id: exerciseId },
        });
        if (!exercise) {
            throw new common_1.NotFoundException('Exercise not found');
        }
        const maxPosition = await this.prisma.sessionExercise.findFirst({
            where: { sessionId },
            orderBy: { position: 'desc' },
            select: { position: true },
        });
        const nextPosition = (maxPosition?.position || 0) + 1;
        return this.prisma.sessionExercise.create({
            data: {
                sessionId,
                exerciseId,
                position: nextPosition,
                config: config || {
                    sets: 3,
                    reps: 10,
                    format: 'standard',
                },
            },
            include: { exercise: true },
        });
    }
};
exports.SessionService = SessionService;
exports.SessionService = SessionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SessionService);
//# sourceMappingURL=session.service.js.map