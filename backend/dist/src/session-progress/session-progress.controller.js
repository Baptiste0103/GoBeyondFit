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
exports.SessionProgressController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const session_progress_service_1 = require("./session-progress.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
let SessionProgressController = class SessionProgressController {
    sessionProgressService;
    constructor(sessionProgressService) {
        this.sessionProgressService = sessionProgressService;
    }
    async getSessionProgress(sessionId, req) {
        return this.sessionProgressService.getProgress(sessionId, req.user.id);
    }
};
exports.SessionProgressController = SessionProgressController;
__decorate([
    (0, common_1.Get)('sessions/:sessionId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Get progress for a session (LEGACY)' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Session progress',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SessionProgressController.prototype, "getSessionProgress", null);
exports.SessionProgressController = SessionProgressController = __decorate([
    (0, swagger_1.ApiTags)('Session Progress'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('session-progress'),
    __metadata("design:paramtypes", [session_progress_service_1.SessionProgressService])
], SessionProgressController);
//# sourceMappingURL=session-progress.controller.js.map