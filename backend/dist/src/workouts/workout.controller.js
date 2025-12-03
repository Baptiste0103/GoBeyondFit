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
exports.WorkoutController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const workout_service_1 = require("./workout.service");
const workout_dto_1 = require("./dto/workout.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
let WorkoutController = class WorkoutController {
    workoutService;
    constructor(workoutService) {
        this.workoutService = workoutService;
    }
    async getMySessions(req, startDate, endDate) {
        const start = startDate ? new Date(startDate) : undefined;
        const end = endDate ? new Date(endDate) : undefined;
        return this.workoutService.getStudentSessions(req.user.id, start, end);
    }
    async getSession(sessionId, req) {
        return this.workoutService.getSessionForWorkout(sessionId, req.user.id);
    }
    async saveProgress(sessionId, exerciseInstanceId, dto, req) {
        return this.workoutService.saveExerciseProgress(sessionId, exerciseInstanceId, req.user.id, dto);
    }
    async addVideo(progressId, dto, req) {
        return this.workoutService.addVideoToProgress(progressId, req.user.id, dto.videoUrl);
    }
    async completeSession(sessionId, dto, req) {
        return this.workoutService.completeSession(sessionId, req.user.id, dto.notes);
    }
};
exports.WorkoutController = WorkoutController;
__decorate([
    (0, common_1.Get)('my-sessions'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_guard_1.Roles)(roles_guard_1.UserRole.STUDENT),
    (0, swagger_1.ApiOperation)({ summary: 'Get my assigned sessions' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'List of sessions assigned to student',
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], WorkoutController.prototype, "getMySessions", null);
__decorate([
    (0, common_1.Get)('sessions/:sessionId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Get session details for workout' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Session with exercises and progress',
    }),
    __param(0, (0, common_1.Param)('sessionId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], WorkoutController.prototype, "getSession", null);
__decorate([
    (0, common_1.Post)('sessions/:sessionId/exercises/:exerciseInstanceId/progress'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Save exercise progress' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.CREATED,
        description: 'Progress saved',
    }),
    __param(0, (0, common_1.Param)('sessionId')),
    __param(1, (0, common_1.Param)('exerciseInstanceId')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, workout_dto_1.UpdateSessionProgressDto, Object]),
    __metadata("design:returntype", Promise)
], WorkoutController.prototype, "saveProgress", null);
__decorate([
    (0, common_1.Post)('progress/:progressId/videos'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Add video to progress' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Video added',
    }),
    __param(0, (0, common_1.Param)('progressId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, workout_dto_1.AddVideoDto, Object]),
    __metadata("design:returntype", Promise)
], WorkoutController.prototype, "addVideo", null);
__decorate([
    (0, common_1.Post)('sessions/:sessionId/complete'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Mark session as complete' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Session completed',
    }),
    __param(0, (0, common_1.Param)('sessionId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, workout_dto_1.CompleteSessionDto, Object]),
    __metadata("design:returntype", Promise)
], WorkoutController.prototype, "completeSession", null);
exports.WorkoutController = WorkoutController = __decorate([
    (0, swagger_1.ApiTags)('Workouts'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('workouts'),
    __metadata("design:paramtypes", [workout_service_1.WorkoutService])
], WorkoutController);
//# sourceMappingURL=workout.controller.js.map