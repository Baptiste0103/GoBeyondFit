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
exports.SessionController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const session_service_1 = require("./session.service");
const session_dto_1 = require("./dto/session.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
let SessionController = class SessionController {
    sessionService;
    constructor(sessionService) {
        this.sessionService = sessionService;
    }
    async getMySessions(req, from, to) {
        return this.sessionService.getStudentSessions(req.user.id, from, to);
    }
    async getSession(sessionId, req) {
        return this.sessionService.getSessionDetails(sessionId, req.user.id);
    }
    async saveProgress(sessionId, progressData, req) {
        return this.sessionService.saveProgress(sessionId, req.user.id, progressData);
    }
    async getMyProgress(sessionId, req) {
        return this.sessionService.getStudentProgress(sessionId, req.user.id);
    }
    async addExerciseToSession(sessionId, addExerciseDto, req) {
        return this.sessionService.addExerciseToSession(sessionId, addExerciseDto.exerciseId, req.user.id, addExerciseDto.config);
    }
};
exports.SessionController = SessionController;
__decorate([
    (0, common_1.Get)('my'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Get my assigned sessions' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'List of student sessions',
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('from')),
    __param(2, (0, common_1.Query)('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], SessionController.prototype, "getMySessions", null);
__decorate([
    (0, common_1.Get)(':sessionId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Get session details with exercises' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Session details',
    }),
    __param(0, (0, common_1.Param)('sessionId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SessionController.prototype, "getSession", null);
__decorate([
    (0, common_1.Post)(':sessionId/progress'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Save workout progress (autosave)' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Progress saved',
    }),
    __param(0, (0, common_1.Param)('sessionId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, session_dto_1.CreateSessionProgressDto, Object]),
    __metadata("design:returntype", Promise)
], SessionController.prototype, "saveProgress", null);
__decorate([
    (0, common_1.Get)(':sessionId/my-progress'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Get my progress on this session' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Student progress',
    }),
    __param(0, (0, common_1.Param)('sessionId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SessionController.prototype, "getMyProgress", null);
__decorate([
    (0, common_1.Post)(':sessionId/exercises'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Add exercise to a session' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Exercise added to session',
    }),
    __param(0, (0, common_1.Param)('sessionId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, session_dto_1.AddExerciseToSessionDto, Object]),
    __metadata("design:returntype", Promise)
], SessionController.prototype, "addExerciseToSession", null);
exports.SessionController = SessionController = __decorate([
    (0, swagger_1.ApiTags)('Sessions & Workout Mode'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('sessions'),
    __metadata("design:paramtypes", [session_service_1.SessionService])
], SessionController);
//# sourceMappingURL=session.controller.js.map