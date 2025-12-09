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
exports.WorkoutService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let WorkoutService = class WorkoutService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getStudentSessions(studentId, startDate, endDate) {
        const query = {
            where: {
                progress: {
                    some: {
                        studentId,
                    },
                },
            },
            include: {
                week: {
                    include: {
                        block: {
                            include: {
                                program: true,
                            },
                        },
                    },
                },
                exercises: {
                    include: {
                        exercise: true,
                    },
                },
                progress: {
                    where: { studentId },
                },
            },
        };
        if (startDate || endDate) {
            query.where.date = {};
            if (startDate)
                query.where.date.gte = startDate;
            if (endDate)
                query.where.date.lte = endDate;
        }
        return this.prisma.session.findMany(query);
    }
    async getSessionForWorkout(sessionId, studentId) {
        const session = await this.prisma.session.findUnique({
            where: { id: sessionId },
            include: {
                week: {
                    include: {
                        block: {
                            include: {
                                program: true,
                            },
                        },
                    },
                },
                exercises: {
                    include: {
                        exercise: true,
                    },
                    orderBy: { position: 'asc' },
                },
                progress: {
                    where: { studentId },
                    orderBy: { savedAt: 'desc' },
                    take: 1,
                },
            },
        });
        if (!session) {
            throw new common_1.NotFoundException('Session not found');
        }
        return session;
    }
    async saveExerciseProgress(sessionId, exerciseInstanceId, studentId, data) {
        const sessionProgress = await this.prisma.sessionProgress.findFirst({
            where: {
                sessionId,
                studentId,
            },
        });
        if (!sessionProgress) {
            return this.prisma.sessionProgress.create({
                data: {
                    sessionId,
                    studentId,
                    progress: data.progress,
                    notes: data.notes,
                },
            });
        }
        return this.prisma.sessionProgress.update({
            where: { id: sessionProgress.id },
            data: {
                progress: data.progress,
                notes: data.notes,
                updatedAt: new Date(),
            },
        });
    }
    async addVideoToProgress(progressId, studentId, videoUrl) {
        const progress = await this.prisma.sessionProgress.findUnique({
            where: { id: progressId },
        });
        if (!progress) {
            throw new common_1.NotFoundException('Progress not found');
        }
        if (progress.studentId !== studentId) {
            throw new common_1.ForbiddenException('Unauthorized');
        }
        return this.prisma.sessionProgress.update({
            where: { id: progressId },
            data: {
                videos: [...(progress.videos || []), videoUrl],
            },
        });
    }
    async completeSession(sessionId, studentId, notes) {
        const session = await this.prisma.session.findUnique({
            where: { id: sessionId },
            include: {
                progress: {
                    where: { studentId },
                },
            },
        });
        if (!session) {
            throw new common_1.NotFoundException('Session not found');
        }
        if (session.progress.length > 0) {
            return this.prisma.sessionProgress.update({
                where: { id: session.progress[0].id },
                data: {
                    notes: notes || session.progress[0].notes,
                    progress: {
                        ...(session.progress[0].progress || {}),
                        completed: true,
                        completedAt: new Date().toISOString(),
                    },
                },
            });
        }
        return this.prisma.sessionProgress.create({
            data: {
                sessionId,
                studentId,
                notes,
                progress: {
                    completed: true,
                    completedAt: new Date().toISOString(),
                },
            },
        });
    }
};
exports.WorkoutService = WorkoutService;
exports.WorkoutService = WorkoutService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WorkoutService);
//# sourceMappingURL=workout.service.js.map