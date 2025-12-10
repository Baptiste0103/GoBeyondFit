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
const workout_config_dto_1 = require("./dto/workout-config.dto");
let WorkoutRunnerService = class WorkoutRunnerService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getOrCreateSessionProgress(sessionId, studentId, session) {
        let sessionProgress = await this.prisma.sessionProgress.findFirst({
            where: {
                sessionId,
                studentId,
            },
        });
        if (!sessionProgress) {
            const exercisesData = session.exercises?.map((ex, index) => {
                let data = {};
                const exerciseType = ex.exercise?.type || 'standard';
                switch (exerciseType) {
                    case 'EMOM':
                        data = { repsPerMinute: [], rpe: null, notes: '' };
                        break;
                    case 'AMRAP':
                        data = { totalReps: 0, rpe: null, notes: '' };
                        break;
                    case 'circuit':
                        data = { roundsCompleted: 0, totalReps: 0, weightUsed: null, rpe: null, notes: '' };
                        break;
                    case 'standard':
                    default:
                        data = { setsCompleted: 0, repsCompleted: 0, weightUsed: null, rpe: null, notes: '' };
                }
                return {
                    position: index,
                    exerciseId: ex.exerciseId,
                    exerciseName: ex.exercise?.name,
                    exerciseType,
                    config: ex.config,
                    status: 'not_started',
                    data,
                    notes: '',
                    videos: [],
                };
            }) || [];
            sessionProgress = await this.prisma.sessionProgress.create({
                data: {
                    sessionId,
                    studentId,
                    status: 'not_started',
                    progress: {
                        sessionId: session.id,
                        sessionTitle: session.title || '',
                        sessionNotes: session.notes || '',
                        week: session.week?.weekNumber || 0,
                        block: session.week?.block?.title || '',
                        program: session.week?.block?.program?.title || '',
                        exercises: exercisesData,
                        summary: {
                            totalExercises: exercisesData.length,
                            completedExercises: 0,
                            inProgressExercises: 0,
                        },
                    },
                    videos: [],
                    notes: session.notes,
                },
            });
        }
        return sessionProgress;
    }
    async startWorkout(userId, sessionId, config = {}) {
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
                },
            },
        });
        if (!session) {
            throw new common_1.NotFoundException('Session not found');
        }
        const program = session.week?.block?.program;
        if (!program) {
            throw new common_1.NotFoundException('Program not found for this session');
        }
        const assignment = await this.prisma.programAssignment.findFirst({
            where: {
                programId: program.id,
                studentId: userId,
            },
        });
        if (!assignment) {
            throw new common_1.BadRequestException('Student not assigned to this program');
        }
        const sessionProgress = await this.getOrCreateSessionProgress(session.id, userId, session);
        const totalExercises = session.exercises?.length || 0;
        console.log(`🟢 [startWorkout] SessionProgress ID: ${sessionProgress.id}`);
        return {
            sessionProgressId: sessionProgress.id,
            sessionId,
            programId: program.id,
            totalExercises,
            progress: sessionProgress.progress,
        };
    }
    async getSessionStatus(userId, sessionId) {
        const sessionProgress = await this.prisma.sessionProgress.findFirst({
            where: {
                sessionId,
                studentId: userId,
            },
        });
        if (!sessionProgress) {
            return {
                exists: false,
                status: 'not_started',
                message: 'Commencer',
            };
        }
        const hasProgress = sessionProgress.progress &&
            sessionProgress.progress.exercises?.some((ex) => ex.data && Object.keys(ex.data).some(k => ex.data[k] !== null && ex.data[k] !== 0 && ex.data[k] !== ''));
        return {
            exists: true,
            hasProgress: hasProgress || false,
            status: hasProgress ? 'in_progress' : 'started',
            message: hasProgress ? 'Modifier' : 'Commencer',
            sessionProgressId: sessionProgress.id,
        };
    }
    async completeExercise(userId, sessionProgressId, exerciseIndex, data) {
        console.log(`🔵 [completeExercise] START - userId: ${userId}, sessionProgressId: ${sessionProgressId}, exerciseIndex: ${exerciseIndex}`);
        const sessionProgress = await this.prisma.sessionProgress.findUnique({
            where: { id: sessionProgressId },
        });
        if (!sessionProgress) {
            throw new common_1.NotFoundException('SessionProgress not found');
        }
        if (sessionProgress.studentId !== userId) {
            throw new common_1.BadRequestException('Unauthorized');
        }
        if (!sessionProgress.sessionId) {
            throw new common_1.BadRequestException('SessionProgress not linked to a session');
        }
        const session = await this.prisma.session.findUnique({
            where: { id: sessionProgress.sessionId },
            include: {
                exercises: {
                    include: {
                        exercise: true,
                    },
                },
            },
        });
        if (!session) {
            throw new common_1.NotFoundException('Session not found');
        }
        const sessionExercise = session.exercises?.[exerciseIndex];
        if (!sessionExercise) {
            throw new common_1.NotFoundException('Exercise not found in session');
        }
        const progressData = sessionProgress.progress || {};
        if (!progressData.exercises) {
            progressData.exercises = [];
        }
        if (progressData.exercises[exerciseIndex]) {
            const exerciseData = progressData.exercises[exerciseIndex];
            const exerciseType = sessionExercise.exercise?.type || 'standard';
            switch (exerciseType) {
                case 'EMOM':
                    exerciseData.data = {
                        repsPerMinute: data.repsPerMinute || exerciseData.data?.repsPerMinute || [],
                        rpe: data.rpe || exerciseData.data?.rpe,
                        notes: data.notes || exerciseData.data?.notes || '',
                    };
                    break;
                case 'AMRAP':
                    exerciseData.data = {
                        totalReps: data.totalReps || exerciseData.data?.totalReps || 0,
                        rpe: data.rpe || exerciseData.data?.rpe,
                        notes: data.notes || exerciseData.data?.notes || '',
                    };
                    break;
                case 'circuit':
                    exerciseData.data = {
                        roundsCompleted: data.roundsCompleted || exerciseData.data?.roundsCompleted || 0,
                        totalReps: data.totalReps || exerciseData.data?.totalReps || 0,
                        weightUsed: data.weight || exerciseData.data?.weightUsed,
                        rpe: data.rpe || exerciseData.data?.rpe,
                        notes: data.notes || exerciseData.data?.notes || '',
                    };
                    break;
                case 'standard':
                default:
                    exerciseData.data = {
                        setsCompleted: data.setsCompleted || exerciseData.data?.setsCompleted || 0,
                        repsCompleted: data.repsCompleted || exerciseData.data?.repsCompleted || 0,
                        weightUsed: data.weight || exerciseData.data?.weightUsed,
                        rpe: data.rpe || exerciseData.data?.rpe,
                        notes: data.notes || exerciseData.data?.notes || '',
                    };
            }
            if (data.videos) {
                exerciseData.videos = [...new Set([...(exerciseData.videos || []), ...data.videos])];
            }
            exerciseData.status = 'completed';
        }
        const summary = progressData.summary || {};
        summary.completedExercises = progressData.exercises?.filter((ex) => ex.status === 'completed').length || 0;
        summary.inProgressExercises = progressData.exercises?.filter((ex) => ex.status === 'in_progress').length || 0;
        summary.skippedExercises = progressData.exercises?.filter((ex) => ex.status === 'skipped').length || 0;
        progressData.summary = summary;
        let newStatus = 'not_started';
        if (summary.completedExercises === summary.completedExercises && summary.completedExercises > 0) {
            newStatus = 'completed';
        }
        else if (summary.completedExercises > 0 || summary.inProgressExercises > 0) {
            newStatus = 'partial';
        }
        const updatedSessionProgress = await this.prisma.sessionProgress.update({
            where: { id: sessionProgress.id },
            data: {
                progress: progressData,
                status: newStatus,
                videos: data.videos ? [...(sessionProgress.videos || []), ...data.videos] : sessionProgress.videos,
                notes: data.notes || sessionProgress.notes,
                updatedAt: new Date(),
            },
        });
        console.log(`🟢 [completeExercise] SUCCESS - Exercise completed`);
        return {
            sessionProgressId: updatedSessionProgress.id,
            sessionProgress: updatedSessionProgress.progress,
            status: updatedSessionProgress.status,
        };
    }
    async saveExerciseData(userId, workoutId, exerciseIndex, data) {
        console.log(`🔵 [saveExerciseData] START - userId: ${userId}, sessionProgressId: ${workoutId}, exerciseIndex: ${exerciseIndex}`);
        const initialSessionProgress = await this.prisma.sessionProgress.findUnique({
            where: { id: workoutId },
            include: {
                session: {
                    include: {
                        exercises: {
                            include: {
                                exercise: true,
                            },
                        },
                    },
                },
            },
        });
        if (!initialSessionProgress) {
            throw new common_1.NotFoundException('SessionProgress not found');
        }
        if (initialSessionProgress.studentId !== userId) {
            throw new common_1.BadRequestException('Unauthorized');
        }
        const session = initialSessionProgress.session;
        if (!session) {
            throw new common_1.NotFoundException('Session not found');
        }
        const sessionExercise = session.exercises?.[exerciseIndex];
        if (!sessionExercise) {
            throw new common_1.NotFoundException('Exercise not found in session');
        }
        let sessionProgress = await this.prisma.sessionProgress.findFirst({
            where: {
                sessionId: session.id,
                studentId: userId,
            },
        });
        if (!sessionProgress) {
            sessionProgress = await this.getOrCreateSessionProgress(session.id, userId, session);
        }
        const progressData = sessionProgress.progress || {};
        if (!progressData.exercises || progressData.exercises.length === 0) {
            const exercisesData = session.exercises?.map((ex, index) => {
                let data = {};
                const exerciseType = ex.exercise?.type || 'standard';
                switch (exerciseType) {
                    case 'EMOM':
                        data = { repsPerMinute: [], rpe: null, notes: '' };
                        break;
                    case 'AMRAP':
                        data = { totalReps: 0, rpe: null, notes: '' };
                        break;
                    case 'circuit':
                        data = { roundsCompleted: 0, totalReps: 0, weightUsed: null, rpe: null, notes: '' };
                        break;
                    case 'standard':
                    default:
                        data = { setsCompleted: 0, repsCompleted: 0, weightUsed: null, rpe: null, notes: '' };
                }
                return {
                    position: index,
                    exerciseId: ex.exerciseId,
                    exerciseName: ex.exercise?.name,
                    exerciseType,
                    config: ex.config,
                    status: 'not_started',
                    data,
                    notes: '',
                    videos: [],
                };
            }) || [];
            progressData.exercises = exercisesData;
        }
        if (progressData.exercises && progressData.exercises[exerciseIndex]) {
            const exerciseData = progressData.exercises[exerciseIndex];
            const exerciseType = sessionExercise.exercise?.type || 'standard';
            console.log(`🔵 [saveExerciseData] Exercise type: ${exerciseType}, data:`, data);
            switch (exerciseType) {
                case 'EMOM':
                    exerciseData.data = {
                        repsPerMinute: data.repsPerMinute || exerciseData.data?.repsPerMinute || [],
                        rpe: data.rpe || exerciseData.data?.rpe,
                        notes: data.notes || exerciseData.data?.notes || '',
                    };
                    break;
                case 'AMRAP':
                    exerciseData.data = {
                        totalReps: data.totalReps || exerciseData.data?.totalReps || 0,
                        rpe: data.rpe || exerciseData.data?.rpe,
                        notes: data.notes || exerciseData.data?.notes || '',
                    };
                    break;
                case 'circuit':
                    exerciseData.data = {
                        roundsCompleted: data.roundsCompleted || exerciseData.data?.roundsCompleted || 0,
                        totalReps: data.totalReps || exerciseData.data?.totalReps || 0,
                        weightUsed: data.weight || exerciseData.data?.weightUsed,
                        rpe: data.rpe || exerciseData.data?.rpe,
                        notes: data.notes || exerciseData.data?.notes || '',
                    };
                    break;
                case 'standard':
                default:
                    const repsPerSetArray = data.repsPerSet || [];
                    const totalRepsFormed = repsPerSetArray.reduce((sum, reps) => sum + (reps || 0), 0);
                    console.log(`🟡 [saveExerciseData] DEBUG - repsPerSetArray:`, repsPerSetArray);
                    console.log(`🟡 [saveExerciseData] DEBUG - totalRepsFormed:`, totalRepsFormed);
                    console.log(`🟡 [saveExerciseData] DEBUG - data.setsCompleted:`, data.setsCompleted);
                    exerciseData.data = {
                        setsCompleted: data.setsCompleted || exerciseData.data?.setsCompleted || 0,
                        repsPerSet: repsPerSetArray,
                        repsCompleted: totalRepsFormed,
                        weightUsed: data.weight !== undefined ? data.weight : exerciseData.data?.weightUsed,
                        rpe: data.rpe || exerciseData.data?.rpe,
                        notes: data.notes || exerciseData.data?.notes || '',
                    };
                    console.log(`🟡 [saveExerciseData] Standard exercise updated:`, exerciseData.data);
            }
            if (data.videos && data.videos.length > 0) {
                exerciseData.videos = [...new Set([...(exerciseData.videos || []), ...data.videos])];
                console.log(`🟡 [saveExerciseData] Videos added:`, exerciseData.videos);
            }
            if (exerciseData.status !== 'completed') {
                exerciseData.status = 'in_progress';
            }
            console.log(`🟡 [saveExerciseData] Exercise status updated to:`, exerciseData.status);
        }
        const summary = progressData.summary || {};
        summary.completedExercises = progressData.exercises?.filter((ex) => ex.status === 'completed').length || 0;
        summary.inProgressExercises = progressData.exercises?.filter((ex) => ex.status === 'in_progress').length || 0;
        summary.totalExercises = progressData.exercises?.length || 0;
        progressData.summary = summary;
        progressData.metadata = progressData.metadata || {};
        progressData.metadata.lastModifiedAt = new Date();
        const updatedSessionProgress = await this.prisma.sessionProgress.update({
            where: { id: sessionProgress.id },
            data: {
                progress: progressData,
                videos: data.videos ? [...new Set([...(sessionProgress.videos || []), ...data.videos])] : sessionProgress.videos,
                notes: data.notes || sessionProgress.notes,
                updatedAt: new Date(),
            },
        });
        console.log(`🟢 [saveExerciseData] SessionProgress updated: ${updatedSessionProgress.id}`);
        return {
            sessionProgressId: updatedSessionProgress.id,
            sessionProgress: updatedSessionProgress.progress,
            status: updatedSessionProgress.status,
            message: 'Exercise data saved',
        };
    }
    async endWorkout(userId, sessionProgressId) {
        const sessionProgress = await this.prisma.sessionProgress.findUnique({
            where: { id: sessionProgressId },
        });
        if (!sessionProgress) {
            throw new common_1.NotFoundException('SessionProgress not found');
        }
        if (sessionProgress.studentId !== userId) {
            throw new common_1.BadRequestException('Unauthorized');
        }
        const endTime = new Date();
        const updatedSessionProgress = await this.prisma.sessionProgress.update({
            where: { id: sessionProgressId },
            data: {
                status: 'completed',
                updatedAt: endTime,
            },
        });
        return {
            sessionProgressId: updatedSessionProgress.id,
            status: updatedSessionProgress.status,
            completedAt: endTime,
        };
    }
    async getWorkoutProgress(userId, sessionProgressId) {
        const sessionProgress = await this.prisma.sessionProgress.findUnique({
            where: { id: sessionProgressId },
            include: {
                session: {
                    include: {
                        exercises: {
                            include: {
                                exercise: true,
                            },
                        },
                        week: {
                            include: {
                                block: {
                                    include: {
                                        program: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
        if (!sessionProgress) {
            throw new common_1.NotFoundException('SessionProgress not found');
        }
        if (sessionProgress.studentId !== userId) {
            throw new common_1.BadRequestException('Unauthorized');
        }
        const session = sessionProgress.session;
        if (!session) {
            throw new common_1.NotFoundException('Session not found');
        }
        const progressData = sessionProgress.progress || {};
        const exercises = progressData.exercises || [];
        const summary = progressData.summary || {};
        const completed = summary.completedExercises || 0;
        const total = summary.totalExercises || session.exercises?.length || 0;
        return {
            sessionProgressId,
            sessionId: session.id,
            session,
            sessionProgress,
            status: sessionProgress.status || 'not_started',
            progress: {
                completed,
                total,
                percentage: Math.round((completed / total) * 100),
                summary,
            },
        };
    }
    async skipExercise(userId, sessionProgressId, exerciseIndex, reason) {
        const sessionProgress = await this.prisma.sessionProgress.findUnique({
            where: { id: sessionProgressId },
        });
        if (!sessionProgress) {
            throw new common_1.NotFoundException('SessionProgress not found');
        }
        if (sessionProgress.studentId !== userId) {
            throw new common_1.BadRequestException('Unauthorized');
        }
        const progressData = sessionProgress.progress || {};
        const exercises = progressData.exercises || [];
        if (exercises[exerciseIndex]) {
            exercises[exerciseIndex].status = 'skipped';
            exercises[exerciseIndex].notes = reason || 'Exercise skipped';
        }
        await this.prisma.sessionProgress.update({
            where: { id: sessionProgressId },
            data: {
                progress: {
                    ...progressData,
                    exercises,
                },
            },
        });
        return { message: 'Exercise skipped' };
    }
    async getUserWorkoutHistory(userId, limit = 20) {
        return this.prisma.sessionProgress.findMany({
            where: { studentId: userId, status: 'completed' },
            orderBy: { updatedAt: 'desc' },
            take: limit,
            include: {
                session: {
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
                    },
                },
            },
        });
    }
    async getSessionProgress(userId, sessionId) {
        const sessionProgress = await this.prisma.sessionProgress.findFirst({
            where: {
                sessionId,
                studentId: userId,
            },
            include: {
                session: {
                    include: {
                        exercises: {
                            include: {
                                exercise: true,
                            },
                        },
                    },
                },
            },
        });
        if (!sessionProgress) {
            throw new common_1.NotFoundException('Session progress not found');
        }
        return sessionProgress;
    }
    async getOrInitializeSessionProgress(userId, sessionId) {
        const session = await this.prisma.session.findUnique({
            where: { id: sessionId },
            include: {
                exercises: {
                    include: {
                        exercise: true,
                    },
                },
                week: {
                    include: {
                        block: {
                            include: {
                                program: true,
                            },
                        },
                    },
                },
            },
        });
        if (!session) {
            throw new common_1.NotFoundException('Session not found');
        }
        let sessionProgress = await this.prisma.sessionProgress.findFirst({
            where: {
                sessionId,
                studentId: userId,
            },
        });
        if (!sessionProgress) {
            sessionProgress = await this.getOrCreateSessionProgress(sessionId, userId, session);
        }
        return {
            sessionProgress,
            session,
            program: session.week?.block?.program,
        };
    }
    validateExerciseConfig(config, type) {
        switch (type) {
            case workout_config_dto_1.ExerciseConfigType.STANDARD:
                return config.sets > 0 && config.reps > 0;
            case workout_config_dto_1.ExerciseConfigType.EMOM:
                return config.totalMinutes > 0 && config.totalMinutes <= 60 && config.repsPerMinute > 0;
            case workout_config_dto_1.ExerciseConfigType.AMRAP:
                return config.timeMinutes > 0 && config.timeMinutes <= 60 && config.targetReps > 0;
            case workout_config_dto_1.ExerciseConfigType.CIRCUIT:
                return config.rounds > 0 && config.repsPerRound > 0;
            default:
                return false;
        }
    }
    validateExerciseProgress(progress, type, config) {
        switch (type) {
            case workout_config_dto_1.ExerciseConfigType.STANDARD:
                if (progress.setsCompleted <= 0 || progress.repsCompleted <= 0) {
                    return { valid: false, error: 'Sets and reps must be positive' };
                }
                return { valid: true };
            case workout_config_dto_1.ExerciseConfigType.EMOM:
                if (!Array.isArray(progress.repsPerMinute)) {
                    return { valid: false, error: 'repsPerMinute must be an array' };
                }
                if (progress.repsPerMinute.length > config.totalMinutes) {
                    return {
                        valid: false,
                        error: `Cannot have more than ${config.totalMinutes} minute entries`,
                    };
                }
                return { valid: true };
            case workout_config_dto_1.ExerciseConfigType.AMRAP:
                if (progress.totalReps <= 0) {
                    return { valid: false, error: 'Total reps must be positive' };
                }
                return { valid: true };
            case workout_config_dto_1.ExerciseConfigType.CIRCUIT:
                if (progress.roundsCompleted <= 0 || progress.totalReps <= 0) {
                    return { valid: false, error: 'Rounds and total reps must be positive' };
                }
                return { valid: true };
            default:
                return { valid: false, error: 'Unknown exercise type' };
        }
    }
    async getCurrentSession(userId) {
        const session = await this.prisma.sessionProgress.findFirst({
            where: {
                studentId: userId,
                status: { not: 'completed' },
            },
            orderBy: { updatedAt: 'desc' },
            include: {
                session: {
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
                    },
                },
            },
        });
        return session || null;
    }
    async getWorkoutStats(userId) {
        const completedSessions = await this.prisma.sessionProgress.findMany({
            where: { studentId: userId, status: 'completed' },
        });
        let totalSetsCompleted = 0;
        let totalExercisesCompleted = 0;
        for (const sp of completedSessions) {
            const progressData = sp.progress || {};
            const exercises = progressData.exercises || [];
            exercises.forEach((ex) => {
                if (ex.status === 'completed') {
                    totalExercisesCompleted++;
                    if (ex.data?.setsCompleted) {
                        totalSetsCompleted += ex.data.setsCompleted;
                    }
                }
            });
        }
        return {
            totalWorkouts: completedSessions.length,
            totalExercisesCompleted,
            totalSetsCompleted,
            lastWorkout: completedSessions[0]?.updatedAt || null,
        };
    }
};
exports.WorkoutRunnerService = WorkoutRunnerService;
exports.WorkoutRunnerService = WorkoutRunnerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WorkoutRunnerService);
//# sourceMappingURL=workout-runner.service.js.map