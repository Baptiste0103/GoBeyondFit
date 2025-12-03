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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_1 = require("@nestjs/jwt");
const user_service_1 = require("./user.service");
const user_dto_1 = require("./dto/user.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
let AuthController = class AuthController {
    userService;
    jwtService;
    constructor(userService, jwtService) {
        this.userService = userService;
        this.jwtService = jwtService;
    }
    async signup(createUserDto) {
        const user = await this.userService.create(createUserDto);
        const token = this.jwtService.sign({
            sub: user.id,
            email: user.email,
            role: user.role,
        });
        return {
            user: {
                id: user.id,
                email: user.email,
                pseudo: user.pseudo,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                profileUrl: user.profileUrl,
            },
            access_token: token,
        };
    }
    async login(loginDto) {
        const user = await this.userService.findByEmailWithPassword(loginDto.email);
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const isPasswordValid = await this.userService.validatePassword(loginDto.password, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const token = this.jwtService.sign({
            sub: user.id,
            email: user.email,
            role: user.role,
        });
        return {
            user: {
                id: user.id,
                email: user.email,
                pseudo: user.pseudo,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                profileUrl: user.profileUrl,
            },
            access_token: token,
        };
    }
    async getCurrentUser(req) {
        if (!req.user) {
            throw new common_1.UnauthorizedException('Not authenticated');
        }
        return this.userService.findById(req.user.id);
    }
    async getAllUsers() {
        return this.userService.findAll();
    }
    async getUserById(id) {
        return this.userService.findById(id);
    }
    async updateUser(id, updateUserDto) {
        return this.userService.update(id, updateUserDto);
    }
    async deleteUser(id) {
        return this.userService.delete(id);
    }
    async getCoachStudents(coachId) {
        return this.userService.getStudentsByCoach(coachId);
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('signup'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new user account' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.CREATED,
        description: 'User created successfully with JWT token',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_dto_1.CreateUserDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "signup", null);
__decorate([
    (0, common_1.Post)('login'),
    (0, swagger_1.ApiOperation)({ summary: 'Login with email and password' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Login successful, returns JWT token',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get current authenticated user' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Current user data',
        type: user_dto_1.UserResponseDto,
    }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getCurrentUser", null);
__decorate([
    (0, common_1.Get)('users'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all users' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'List of all users',
        type: [user_dto_1.UserResponseDto],
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getAllUsers", null);
__decorate([
    (0, common_1.Get)('users/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user by ID' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'User found',
        type: user_dto_1.UserResponseDto,
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getUserById", null);
__decorate([
    (0, common_1.Put)('users/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update user profile' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'User updated',
        type: user_dto_1.UserResponseDto,
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_dto_1.UpdateUserDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "updateUser", null);
__decorate([
    (0, common_1.Delete)('users/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete user' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'User deleted',
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "deleteUser", null);
__decorate([
    (0, common_1.Get)('students/:coachId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get students managed by a coach' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'List of students',
        type: [user_dto_1.UserResponseDto],
    }),
    __param(0, (0, common_1.Param)('coachId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getCoachStudents", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('Auth & Users'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [user_service_1.UserService,
        jwt_1.JwtService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map