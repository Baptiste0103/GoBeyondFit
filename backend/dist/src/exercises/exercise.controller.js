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
exports.ExerciseController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const exercise_service_1 = require("./exercise.service");
const dto_1 = require("./dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
let ExerciseController = class ExerciseController {
    exerciseService;
    constructor(exerciseService) {
        this.exerciseService = exerciseService;
    }
    async create(createExerciseDto, req) {
        return this.exerciseService.create(createExerciseDto, req.user.id);
    }
    async searchLibrary(req, search, difficulty, muscleGroup, page, limit) {
        return this.exerciseService.searchLibrary({
            search,
            difficulty,
            muscleGroup,
            page: Math.max(1, page || 1),
            limit: Math.min(100, Math.max(1, limit || 20)),
            userId: req.user.id,
        });
    }
    async findAll(req) {
        return this.exerciseService.findAll(req.user.id);
    }
    async findOne(id, req) {
        return this.exerciseService.findOne(id, req.user.id);
    }
    async update(id, updateExerciseDto, req) {
        return this.exerciseService.update(id, updateExerciseDto, req.user.id);
    }
    async getCoachExercises(req, page, limit, search) {
        return this.exerciseService.getCoachExercises(req.user.id, {
            page: Math.max(1, page || 1),
            limit: Math.min(100, Math.max(1, limit || 20)),
            search,
        });
    }
    async remove(id, req) {
        return this.exerciseService.remove(id, req.user.id);
    }
};
exports.ExerciseController = ExerciseController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new exercise' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.CREATED,
        description: 'Exercise created',
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateExerciseDto, Object]),
    __metadata("design:returntype", Promise)
], ExerciseController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('library/search'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Search exercises in library with pagination and filters' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'List of exercises with search results',
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('q')),
    __param(2, (0, common_1.Query)('difficulty')),
    __param(3, (0, common_1.Query)('muscle')),
    __param(4, (0, common_1.Query)('page')),
    __param(5, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, Number, Number]),
    __metadata("design:returntype", Promise)
], ExerciseController.prototype, "searchLibrary", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Get all exercises visible to user' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'List of exercises',
    }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ExerciseController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Get exercise by ID with all details' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Exercise found with complete details',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ExerciseController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Update exercise' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Exercise updated',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateExerciseDto, Object]),
    __metadata("design:returntype", Promise)
], ExerciseController.prototype, "update", null);
__decorate([
    (0, common_1.Get)('my/created'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Get exercises created by current coach' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'List of exercises created by coach',
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number, String]),
    __metadata("design:returntype", Promise)
], ExerciseController.prototype, "getCoachExercises", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Delete exercise' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Exercise deleted',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ExerciseController.prototype, "remove", null);
exports.ExerciseController = ExerciseController = __decorate([
    (0, swagger_1.ApiTags)('Exercises'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('exercises'),
    __metadata("design:paramtypes", [exercise_service_1.ExerciseService])
], ExerciseController);
//# sourceMappingURL=exercise.controller.js.map