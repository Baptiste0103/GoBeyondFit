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
exports.ProgramController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const program_service_1 = require("./program.service");
const program_dto_1 = require("./dto/program.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
let ProgramController = class ProgramController {
    programService;
    constructor(programService) {
        this.programService = programService;
    }
    async create(body, req) {
        console.log('CREATE POST body:', body);
        console.log('CREATE POST req.user.id:', req?.user?.id);
        return this.programService.createProgram(body, req?.user?.id || 'unknown');
    }
    async findAll(req) {
        const userRole = req.user?.role?.toLowerCase?.() || req.user?.role;
        if (userRole === 'coach') {
            return this.programService.findByCoach(req.user.id);
        }
        if (userRole === 'student') {
            return this.programService.getAssignedPrograms(req.user.id);
        }
        return this.programService.findAll();
    }
    async findByCoach(coachId) {
        return this.programService.findByCoach(coachId);
    }
    async getAssignedPrograms(studentId, req) {
        if (req.user.role === roles_guard_1.UserRole.STUDENT && req.user.id !== studentId) {
            throw new Error('Forbidden');
        }
        return this.programService.getAssignedPrograms(studentId);
    }
    async getAuditLog(id, req) {
        return this.programService.getAuditLog(id, req.user.id);
    }
    async findById(id, req) {
        return this.programService.findById(id, req.user.id);
    }
    async update(id, updateProgramDto, req) {
        return this.programService.update(id, updateProgramDto, req.user.id);
    }
    async delete(id, req) {
        return this.programService.delete(id, req.user.id);
    }
    async assignToStudent(programId, studentId, req) {
        return this.programService.assignToStudent(programId, studentId, req.user.id);
    }
    async removeAssignment(assignmentId, req) {
        return this.programService.removeAssignment(assignmentId, req.user.id);
    }
};
exports.ProgramController = ProgramController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_guard_1.Roles)(roles_guard_1.UserRole.COACH, roles_guard_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new program with nested structure' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.CREATED,
        description: 'Program created',
        type: program_dto_1.ProgramResponseDto,
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ProgramController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Get all programs' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'List of programs',
        type: [program_dto_1.ProgramResponseDto],
    }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProgramController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('coach/:coachId'),
    (0, swagger_1.ApiOperation)({ summary: "Get programs created by a coach" }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'List of coach programs',
        type: [program_dto_1.ProgramResponseDto],
    }),
    __param(0, (0, common_1.Param)('coachId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProgramController.prototype, "findByCoach", null);
__decorate([
    (0, common_1.Get)('assigned/:studentId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Get programs assigned to a student' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'List of assigned programs',
        type: [program_dto_1.ProgramResponseDto],
    }),
    __param(0, (0, common_1.Param)('studentId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ProgramController.prototype, "getAssignedPrograms", null);
__decorate([
    (0, common_1.Get)(':id/audit'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_guard_1.Roles)(roles_guard_1.UserRole.COACH, roles_guard_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get audit log for a program' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Audit log entries',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ProgramController.prototype, "getAuditLog", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Get program by ID with full structure' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Program details',
        type: program_dto_1.ProgramResponseDto,
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ProgramController.prototype, "findById", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_guard_1.Roles)(roles_guard_1.UserRole.COACH, roles_guard_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Update program' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Program updated',
        type: program_dto_1.ProgramResponseDto,
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, program_dto_1.UpdateProgramDto, Object]),
    __metadata("design:returntype", Promise)
], ProgramController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_guard_1.Roles)(roles_guard_1.UserRole.COACH, roles_guard_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Delete program' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Program deleted',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ProgramController.prototype, "delete", null);
__decorate([
    (0, common_1.Post)(':programId/assign/:studentId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_guard_1.Roles)(roles_guard_1.UserRole.COACH, roles_guard_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Assign program to a student' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.CREATED,
        description: 'Program assigned',
    }),
    __param(0, (0, common_1.Param)('programId')),
    __param(1, (0, common_1.Param)('studentId')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ProgramController.prototype, "assignToStudent", null);
__decorate([
    (0, common_1.Delete)(':assignmentId/assignment'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_guard_1.Roles)(roles_guard_1.UserRole.COACH, roles_guard_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Remove program assignment' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Assignment removed',
    }),
    __param(0, (0, common_1.Param)('assignmentId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ProgramController.prototype, "removeAssignment", null);
exports.ProgramController = ProgramController = __decorate([
    (0, swagger_1.ApiTags)('Programs'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('programs'),
    __metadata("design:paramtypes", [program_service_1.ProgramService])
], ProgramController);
//# sourceMappingURL=program.controller.js.map