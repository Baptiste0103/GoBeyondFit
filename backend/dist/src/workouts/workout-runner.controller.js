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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkoutRunnerController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const workout_runner_service_1 = require("./workout-runner.service");
let WorkoutRunnerController = class WorkoutRunnerController {
    workoutService;
    constructor(workoutService) {
        this.workoutService = workoutService;
    }
    async startWorkout(sessionId, config, req) {
        return this.workoutService.startWorkout(req.user.id, sessionId, config);
    }
    async getSessionStatus(sessionId, req) {
        return this.workoutService.getSessionStatus(req.user.id, sessionId);
    }
    async getHistory(limit = 20, req) {
        return this.workoutService.getUserWorkoutHistory(req.user.id, Math.min(limit, 100));
    }
    async getCurrentSession(req) {
        const session = await this.workoutService.getCurrentSession(req.user.id);
        if (!session) {
            return { session: null, message: 'No active workout session' };
        }
        return { session };
    }
    async getStats(req) {
        return this.workoutService.getWorkoutStats(req.user.id);
    }
    async getSessionProgress(sessionId, req) {
        return this.workoutService.getOrInitializeSessionProgress(req.user.id, sessionId);
    }
    async completeExercise(workoutId, exerciseIndex, data, req) {
        return this.workoutService.completeExercise(req.user.id, workoutId, exerciseIndex, data);
    }
    async saveExerciseData(workoutId, exerciseIndex, data, req) {
        return this.workoutService.saveExerciseData(req.user.id, workoutId, exerciseIndex, data);
    }
    async skipExercise(workoutId, exerciseIndex, { reason }, req) {
        return this.workoutService.skipExercise(req.user.id, workoutId, exerciseIndex, reason);
    }
    async endWorkout(workoutId, req) {
        return this.workoutService.endWorkout(req.user.id, workoutId);
    }
    async getProgress(workoutId, req) {
        return this.workoutService.getWorkoutProgress(req.user.id, workoutId);
    }
};
exports.WorkoutRunnerController = WorkoutRunnerController;
__decorate([
    (0, common_1.Post)('start/:sessionId'),
    (0, common_1.HttpCode)(201),
    __param(0, (0, common_1.Param)('sessionId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], WorkoutRunnerController.prototype, "startWorkout", null);
__decorate([
    (0, common_1.Get)('session/:sessionId/status'),
    __param(0, (0, common_1.Param)('sessionId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], WorkoutRunnerController.prototype, "getSessionStatus", null);
__decorate([
    (0, common_1.Get)('history/list'),
    __param(0, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(20), common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], WorkoutRunnerController.prototype, "getHistory", null);
__decorate([
    (0, common_1.Get)('current'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WorkoutRunnerController.prototype, "getCurrentSession", null);
__decorate([
    (0, common_1.Get)('stats/summary'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WorkoutRunnerController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('session/:sessionId/progress'),
    __param(0, (0, common_1.Param)('sessionId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], WorkoutRunnerController.prototype, "getSessionProgress", null);
__decorate([
    (0, common_1.Post)(':workoutId/exercise/:exerciseIndex/complete'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Param)('workoutId')),
    __param(1, (0, common_1.Param)('exerciseIndex', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Object, Object]),
    __metadata("design:returntype", Promise)
], WorkoutRunnerController.prototype, "completeExercise", null);
__decorate([
    (0, common_1.Post)(':workoutId/exercise/:exerciseIndex/save'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Param)('workoutId')),
    __param(1, (0, common_1.Param)('exerciseIndex', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Object, Object]),
    __metadata("design:returntype", Promise)
], WorkoutRunnerController.prototype, "saveExerciseData", null);
__decorate([
    (0, common_1.Post)(':workoutId/exercise/:exerciseIndex/skip'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Param)('workoutId')),
    __param(1, (0, common_1.Param)('exerciseIndex', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Object, Object]),
    __metadata("design:returntype", Promise)
], WorkoutRunnerController.prototype, "skipExercise", null);
__decorate([
    (0, common_1.Post)(':workoutId/end'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Param)('workoutId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], WorkoutRunnerController.prototype, "endWorkout", null);
__decorate([
    (0, common_1.Get)(':workoutId/progress'),
    __param(0, (0, common_1.Param)('workoutId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], WorkoutRunnerController.prototype, "getProgress", null);
exports.WorkoutRunnerController = WorkoutRunnerController = __decorate([
    (0, common_1.Controller)('workouts'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [workout_runner_service_1.WorkoutRunnerService])
], WorkoutRunnerController);
//# sourceMappingURL=workout-runner.controller.js.map