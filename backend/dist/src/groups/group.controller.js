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
exports.GroupController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const group_service_1 = require("./group.service");
const dto_1 = require("./dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
let GroupController = class GroupController {
    groupService;
    constructor(groupService) {
        this.groupService = groupService;
    }
    async create(createGroupDto, req) {
        return this.groupService.create(createGroupDto, req.user.id);
    }
    async findAll(req) {
        return this.groupService.findAll(req.user.id);
    }
    async findOne(id, req) {
        return this.groupService.findOne(id, req.user.id);
    }
    async update(id, updateGroupDto, req) {
        return this.groupService.update(id, updateGroupDto, req.user.id);
    }
    async remove(id, req) {
        return this.groupService.remove(id, req.user.id);
    }
    async inviteUser(groupId, createInvitationDto, req) {
        return this.groupService.inviteUser({ ...createInvitationDto, groupId }, req.user.id);
    }
    async getMyInvitations(req) {
        return this.groupService.getInvitations(req.user.id);
    }
    async respondToInvitation(invitationId, respondInvitationDto, req) {
        return this.groupService.respondToInvitation(invitationId, respondInvitationDto, req.user.id);
    }
    async addMember(groupId, memberUserId, req) {
        return this.groupService.addMember(groupId, req.user.id, memberUserId);
    }
    async removeMember(groupId, memberUserId, req) {
        return this.groupService.removeMember(groupId, req.user.id, memberUserId);
    }
};
exports.GroupController = GroupController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new group' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.CREATED,
        description: 'Group created',
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateGroupDto, Object]),
    __metadata("design:returntype", Promise)
], GroupController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Get all user groups' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'List of user groups',
    }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GroupController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Get group by ID' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Group details',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], GroupController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Update group' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Group updated',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateGroupDto, Object]),
    __metadata("design:returntype", Promise)
], GroupController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Delete group' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Group deleted',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], GroupController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/invite'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Invite user to group' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.CREATED,
        description: 'Invitation sent',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.CreateInvitationDto, Object]),
    __metadata("design:returntype", Promise)
], GroupController.prototype, "inviteUser", null);
__decorate([
    (0, common_1.Get)('invitations/me'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Get my invitations' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'List of invitations',
    }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GroupController.prototype, "getMyInvitations", null);
__decorate([
    (0, common_1.Post)('invitations/:invitationId/respond'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Respond to invitation' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Invitation responded',
    }),
    __param(0, (0, common_1.Param)('invitationId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.RespondInvitationDto, Object]),
    __metadata("design:returntype", Promise)
], GroupController.prototype, "respondToInvitation", null);
__decorate([
    (0, common_1.Post)(':id/members'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Add member to group' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.CREATED,
        description: 'Member added',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('userId')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], GroupController.prototype, "addMember", null);
__decorate([
    (0, common_1.Delete)(':id/members/:memberUserId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Remove member from group' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Member removed',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('memberUserId')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], GroupController.prototype, "removeMember", null);
exports.GroupController = GroupController = __decorate([
    (0, swagger_1.ApiTags)('Groups'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('groups'),
    __metadata("design:paramtypes", [group_service_1.GroupService])
], GroupController);
//# sourceMappingURL=group.controller.js.map