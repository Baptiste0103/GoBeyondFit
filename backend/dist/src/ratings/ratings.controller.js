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
exports.RatingsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const ratings_service_1 = require("./ratings.service");
const rating_dto_1 = require("./dto/rating.dto");
let RatingsController = class RatingsController {
    ratingsService;
    constructor(ratingsService) {
        this.ratingsService = ratingsService;
    }
    async submitRating(exerciseId, dto, req) {
        if (!exerciseId) {
            throw new common_1.BadRequestException('Exercise ID is required');
        }
        if (dto.rating < 1 || dto.rating > 5) {
            throw new common_1.BadRequestException('Rating must be between 1 and 5');
        }
        return this.ratingsService.createOrUpdateRating(exerciseId, req.user.id, dto);
    }
    async getExerciseRatings(exerciseId, req) {
        if (!exerciseId) {
            throw new common_1.BadRequestException('Exercise ID is required');
        }
        return this.ratingsService.getExerciseRatings(exerciseId, req.user.id);
    }
    async getUserRating(exerciseId, req) {
        if (!exerciseId) {
            throw new common_1.BadRequestException('Exercise ID is required');
        }
        return this.ratingsService.getUserRating(exerciseId, req.user.id);
    }
    async updateRating(exerciseId, ratingId, dto, req) {
        if (!ratingId) {
            throw new common_1.BadRequestException('Rating ID is required');
        }
        if (dto.rating && (dto.rating < 1 || dto.rating > 5)) {
            throw new common_1.BadRequestException('Rating must be between 1 and 5');
        }
        return this.ratingsService.updateRating(ratingId, req.user.id, exerciseId, dto);
    }
    async deleteRating(exerciseId, ratingId, req) {
        if (!ratingId) {
            throw new common_1.BadRequestException('Rating ID is required');
        }
        return this.ratingsService.deleteRating(ratingId, req.user.id, exerciseId);
    }
};
exports.RatingsController = RatingsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Param)('exerciseId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, rating_dto_1.CreateRatingDto, Object]),
    __metadata("design:returntype", Promise)
], RatingsController.prototype, "submitRating", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Param)('exerciseId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RatingsController.prototype, "getExerciseRatings", null);
__decorate([
    (0, common_1.Get)('me'),
    __param(0, (0, common_1.Param)('exerciseId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RatingsController.prototype, "getUserRating", null);
__decorate([
    (0, common_1.Put)(':ratingId'),
    __param(0, (0, common_1.Param)('exerciseId')),
    __param(1, (0, common_1.Param)('ratingId')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, rating_dto_1.UpdateRatingDto, Object]),
    __metadata("design:returntype", Promise)
], RatingsController.prototype, "updateRating", null);
__decorate([
    (0, common_1.Delete)(':ratingId'),
    (0, common_1.HttpCode)(204),
    __param(0, (0, common_1.Param)('exerciseId')),
    __param(1, (0, common_1.Param)('ratingId')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], RatingsController.prototype, "deleteRating", null);
exports.RatingsController = RatingsController = __decorate([
    (0, common_1.Controller)('exercises/:exerciseId/ratings'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [ratings_service_1.RatingsService])
], RatingsController);
//# sourceMappingURL=ratings.controller.js.map