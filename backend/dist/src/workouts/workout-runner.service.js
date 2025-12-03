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
exports.WorkoutRunnerService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let WorkoutRunnerService = class WorkoutRunnerService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async startWorkout(userId, sessionId, config = {}) {
        const session = await this.prisma.session.findUnique({
            where: { id: sessionId },
        });
        if (!session) {
            throw new common_1.NotFoundException('Session not found');
        }
        const sessionData = session.data || {};
        const totalExercises = sessionData.exercises?.length || 0;
        const workout = await this.prisma.workoutSession.create({
            data: {
                userId,
                startedAt: new Date(),
                startTime: new Date(),
                exercisesCompleted: 0,
                totalExercises,
                restPeriodSeconds: config.restPeriodSeconds || 60,
                formGuidanceEnabled: config.formGuidanceEnabled ?? true,
            },
        });
        return {
            workoutId: workout.id,
            sessionId,
            totalExercises,
            restPeriod: workout.restPeriodSeconds,
            formGuidance: workout.formGuidanceEnabled,
            startedAt: workout.startedAt,
        };
    }
    async completeExercise(userId, workoutId, exerciseIndex, data) {
        const workout = await this.prisma.workoutSession.findUnique({
            where: { id: workoutId },
        });
        if (!workout) {
            throw new common_1.NotFoundException('Workout not found');
        }
        if (workout.userId !== userId) {
            throw new common_1.BadRequestException('Unauthorized');
        }
        const exerciseLog = await this.prisma.exerciseLog.create({
            data: {
                sessionId: workoutId,
                exerciseId: 'placeholder-exercise-id',
                userId,
                setsCompleted: data.setsCompleted,
                weight: data.weight,
                duration: data.duration,
                notes: data.notes,
                formRating: data.formRating,
                completedAt: new Date(),
            },
        });
        const updatedWorkout = await this.prisma.workoutSession.update({
            where: { id: workoutId },
            data: {
                exercisesCompleted: (workout.exercisesCompleted || 0) + 1,
            },
        });
        const completed = updatedWorkout.exercisesCompleted || 0;
        const total = updatedWorkout.totalExercises || 1;
        return {
            exerciseLogId: exerciseLog.id,
            progress: {
                completed,
                total,
                percentage: Math.round((completed / total) * 100),
            },
        };
    }
    async endWorkout(userId, workoutId) {
        const workout = await this.prisma.workoutSession.findUnique({
            where: { id: workoutId },
        });
        if (!workout) {
            throw new common_1.NotFoundException('Workout not found');
        }
        if (workout.userId !== userId) {
            throw new common_1.BadRequestException('Unauthorized');
        }
        const endTime = new Date();
        const startTime = workout.startTime || workout.startedAt;
        const duration = (endTime.getTime() - (startTime?.getTime() || 0)) / 1000 / 60;
        const updatedWorkout = await this.prisma.workoutSession.update({
            where: { id: workoutId },
            data: {
                endedAt: endTime,
                endTime: endTime,
                duration: Math.round(duration * 60),
            },
        });
        const completed = updatedWorkout.exercisesCompleted || 0;
        const total = updatedWorkout.totalExercises || 1;
        return {
            workoutId: updatedWorkout.id,
            completedAt: updatedWorkout.endedAt,
            duration: Math.round(duration),
            exercisesCompleted: completed,
            totalExercises: total,
            completionRate: Math.round((completed / total) * 100),
        };
    }
    async getWorkoutProgress(userId, workoutId) {
        const workout = await this.prisma.workoutSession.findUnique({
            where: { id: workoutId },
        });
        if (!workout) {
            throw new common_1.NotFoundException('Workout not found');
        }
        if (workout.userId !== userId) {
            throw new common_1.BadRequestException('Unauthorized');
        }
        const logs = await this.prisma.exerciseLog.findMany({
            where: { sessionId: workoutId },
            orderBy: { completedAt: 'asc' },
        });
        const completed = workout.exercisesCompleted || 0;
        const total = workout.totalExercises || 1;
        return {
            workoutId,
            progress: {
                completed,
                total,
                percentage: Math.round((completed / total) * 100),
            },
            isActive: !workout.endedAt,
            startedAt: workout.startedAt,
            endedAt: workout.endedAt,
            exerciseLogs: logs,
            restPeriod: workout.restPeriodSeconds,
        };
    }
    async skipExercise(userId, workoutId, exerciseIndex, reason) {
        const workout = await this.prisma.workoutSession.findUnique({
            where: { id: workoutId },
        });
        if (!workout) {
            throw new common_1.NotFoundException('Workout not found');
        }
        if (workout.userId !== userId) {
            throw new common_1.BadRequestException('Unauthorized');
        }
        await this.prisma.exerciseLog.create({
            data: {
                sessionId: workoutId,
                exerciseId: 'placeholder-exercise-id',
                userId,
                skipped: true,
                notes: reason,
                completedAt: new Date(),
            },
        });
        return { message: 'Exercise skipped' };
    }
    async getUserWorkoutHistory(userId, limit = 20) {
        return this.prisma.workoutSession.findMany({
            where: { userId, endedAt: { not: null } },
            orderBy: { endedAt: 'desc' },
            take: limit,
        });
    }
    async getWorkoutStats(userId) {
        const workouts = await this.prisma.workoutSession.findMany({
            where: { userId, endedAt: { not: null } },
        });
        const completedExercises = await this.prisma.exerciseLog.aggregate({
            where: { userId, skipped: false },
            _sum: { setsCompleted: true },
            _count: true,
        });
        const totalWorkoutTime = workouts.reduce((sum, w) => {
            if (w.endedAt && (w.startTime || w.startedAt)) {
                const startT = w.startTime || w.startedAt;
                return sum + (w.endedAt.getTime() - startT.getTime()) / 1000 / 60;
            }
            return sum;
        }, 0);
        return {
            totalWorkouts: workouts.length,
            totalExercisesCompleted: completedExercises._count,
            totalSetsCompleted: completedExercises._sum.setsCompleted || 0,
            totalWorkoutMinutes: Math.round(totalWorkoutTime),
            averageWorkoutDuration: workouts.length > 0 ? Math.round(totalWorkoutTime / workouts.length) : 0,
            lastWorkout: workouts[0]?.endedAt || null,
        };
    }
};
exports.WorkoutRunnerService = WorkoutRunnerService;
exports.WorkoutRunnerService = WorkoutRunnerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WorkoutRunnerService);
//# sourceMappingURL=workout-runner.service.js.map