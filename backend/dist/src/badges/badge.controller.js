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
exports.BadgeController = void 0;
const common_1 = require("@nestjs/common");
const badge_service_1 = require("./badge.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
let BadgeController = class BadgeController {
    badgeService;
    constructor(badgeService) {
        this.badgeService = badgeService;
    }
    async getMyBadges(req) {
        const userId = req.user.id;
        return this.badgeService.getUserBadges(userId);
    }
    async getProgress(req) {
        const userId = req.user.id;
        return this.badgeService.getBadgeProgress(userId);
    }
    async getAllBadges() {
        return this.badgeService.getAllBadges();
    }
};
exports.BadgeController = BadgeController;
__decorate([
    (0, common_1.Get)('my-badges'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BadgeController.prototype, "getMyBadges", null);
__decorate([
    (0, common_1.Get)('progress'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BadgeController.prototype, "getProgress", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BadgeController.prototype, "getAllBadges", null);
exports.BadgeController = BadgeController = __decorate([
    (0, common_1.Controller)('badges'),
    __metadata("design:paramtypes", [badge_service_1.BadgeService])
], BadgeController);
//# sourceMappingURL=badge.controller.js.map