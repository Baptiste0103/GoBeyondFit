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
exports.UserHistoryController = exports.HistoryController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const history_service_1 = require("./history.service");
const history_dto_1 = require("./dto/history.dto");
let HistoryController = class HistoryController {
    historyService;
    constructor(historyService) {
        this.historyService = historyService;
    }
    async logView(exerciseId, dto, req) {
        return this.historyService.logView(req.user.id, {
            ...dto,
            exerciseId,
        });
    }
    async getViewCount(exerciseId) {
        return this.historyService.getExerciseViewCount(exerciseId);
    }
    async getUniqueViewCount(exerciseId) {
        return this.historyService.getExerciseUniqueViewCount(exerciseId);
    }
};
exports.HistoryController = HistoryController;
__decorate([
    (0, common_1.Post)(':id/view'),
    (0, common_1.HttpCode)(201),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, history_dto_1.LogViewDto, Object]),
    __metadata("design:returntype", Promise)
], HistoryController.prototype, "logView", null);
__decorate([
    (0, common_1.Get)(':id/view-count'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], HistoryController.prototype, "getViewCount", null);
__decorate([
    (0, common_1.Get)(':id/unique-views'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], HistoryController.prototype, "getUniqueViewCount", null);
exports.HistoryController = HistoryController = __decorate([
    (0, common_1.Controller)('exercises'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [history_service_1.HistoryService])
], HistoryController);
let UserHistoryController = class UserHistoryController {
    historyService;
    constructor(historyService) {
        this.historyService = historyService;
    }
    async getUserHistory(req, page = 1, limit = 20, from, to) {
        if (limit > 100)
            limit = 100;
        if (page < 1)
            page = 1;
        return this.historyService.getUserHistory(req.user.id, page, limit, from, to);
    }
    async getRecentlyViewed(limit, req) {
        return this.historyService.getRecentlyViewed(req.user.id, Math.min(limit, 50));
    }
    async clearHistory(req) {
        return this.historyService.clearHistory(req.user.id);
    }
    async deleteEntry(entryId, req) {
        return this.historyService.deleteHistoryEntry(req.user.id, entryId);
    }
};
exports.UserHistoryController = UserHistoryController;
__decorate([
    (0, common_1.Get)('exercises'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('page', new common_1.DefaultValuePipe(1), common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(20), common_1.ParseIntPipe)),
    __param(3, (0, common_1.Query)('from')),
    __param(4, (0, common_1.Query)('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number, String, String]),
    __metadata("design:returntype", Promise)
], UserHistoryController.prototype, "getUserHistory", null);
__decorate([
    (0, common_1.Get)('recent'),
    __param(0, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(8), common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], UserHistoryController.prototype, "getRecentlyViewed", null);
__decorate([
    (0, common_1.Delete)('exercises'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserHistoryController.prototype, "clearHistory", null);
__decorate([
    (0, common_1.Delete)('entries/:entryId'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Param)('entryId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UserHistoryController.prototype, "deleteEntry", null);
exports.UserHistoryController = UserHistoryController = __decorate([
    (0, common_1.Controller)('users/history'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [history_service_1.HistoryService])
], UserHistoryController);
//# sourceMappingURL=history.controller.js.map