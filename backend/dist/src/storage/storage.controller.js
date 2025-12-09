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
exports.StorageController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const exercise_media_service_1 = require("./exercise-media.service");
let StorageController = class StorageController {
    exerciseMediaService;
    constructor(exerciseMediaService) {
        this.exerciseMediaService = exerciseMediaService;
    }
    async uploadProgressVideo(progressId, file, req) {
        if (!file) {
            throw new common_1.BadRequestException('No video file provided');
        }
        const userId = req.user?.id;
        if (!userId) {
            throw new common_1.ForbiddenException('User not authenticated');
        }
        console.log(`📹 [StorageController] Video upload started for progressId: ${progressId}`);
        console.log(`📹 [StorageController] File: ${file.originalname}, MIME: ${file.mimetype}, Size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
        try {
            const media = await this.exerciseMediaService.saveVideoToProgress(progressId, userId, file.buffer, file.mimetype);
            console.log(`✅ [StorageController] Video upload complete - Media ID: ${media.id}, Compressed size: ${(media.size / 1024 / 1024).toFixed(2)}MB`);
            return {
                success: true,
                media: {
                    id: media.id,
                    size: media.size,
                    mimeType: media.mimeType,
                    createdAt: media.createdAt,
                },
            };
        }
        catch (error) {
            console.error(`❌ [StorageController] Video upload failed:`, error);
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException(`Failed to process video: ${error.message}`);
        }
    }
    async getProgressVideos(progressId, req) {
        const userId = req.user?.id;
        if (!userId) {
            throw new common_1.ForbiddenException('User not authenticated');
        }
        try {
            const videos = await this.exerciseMediaService.getProgressVideos(progressId, userId);
            return {
                success: true,
                count: videos.length,
                videos: videos.map((v) => ({
                    id: v.id,
                    size: v.size,
                    mimeType: v.mimeType,
                    createdAt: v.createdAt,
                })),
            };
        }
        catch (error) {
            if (error instanceof common_1.ForbiddenException) {
                throw error;
            }
            throw new common_1.BadRequestException(`Failed to retrieve videos: ${error.message}`);
        }
    }
    async downloadVideo(mediaId, req, res) {
        const userId = req.user?.id;
        if (!userId) {
            throw new common_1.ForbiddenException('User not authenticated');
        }
        try {
            const media = await this.exerciseMediaService.getVideoFromProgress(mediaId, userId);
            if (!media) {
                throw new common_1.NotFoundException('Video not found');
            }
            res.set({
                'Content-Type': media.mimeType,
                'Content-Length': media.size,
                'Content-Disposition': `attachment; filename="video-${mediaId}.mp4"`,
            });
            res.send(media.data);
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException || error instanceof common_1.ForbiddenException) {
                throw error;
            }
            throw new common_1.BadRequestException(`Failed to download video: ${error.message}`);
        }
    }
    async deleteVideo(mediaId, req) {
        const userId = req.user?.id;
        if (!userId) {
            throw new common_1.ForbiddenException('User not authenticated');
        }
        try {
            await this.exerciseMediaService.deleteVideoFromProgress(mediaId, userId);
            return {
                success: true,
                message: 'Video deleted successfully',
            };
        }
        catch (error) {
            if (error instanceof common_1.ForbiddenException) {
                throw error;
            }
            throw new common_1.BadRequestException(`Failed to delete video: ${error.message}`);
        }
    }
    async getMediaStats() {
        try {
            const stats = await this.exerciseMediaService.getMediaStats();
            return {
                success: true,
                stats,
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(`Failed to retrieve stats: ${error.message}`);
        }
    }
};
exports.StorageController = StorageController;
__decorate([
    (0, common_1.Post)('progress/:progressId/video'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('video', { limits: { fileSize: 100 * 1024 * 1024 } })),
    __param(0, (0, common_1.Param)('progressId')),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], StorageController.prototype, "uploadProgressVideo", null);
__decorate([
    (0, common_1.Get)('progress/:progressId/videos'),
    __param(0, (0, common_1.Param)('progressId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], StorageController.prototype, "getProgressVideos", null);
__decorate([
    (0, common_1.Get)('videos/:mediaId'),
    __param(0, (0, common_1.Param)('mediaId')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], StorageController.prototype, "downloadVideo", null);
__decorate([
    (0, common_1.Delete)('videos/:mediaId'),
    __param(0, (0, common_1.Param)('mediaId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], StorageController.prototype, "deleteVideo", null);
__decorate([
    (0, common_1.Get)('stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], StorageController.prototype, "getMediaStats", null);
exports.StorageController = StorageController = __decorate([
    (0, common_1.Controller)('storage'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [exercise_media_service_1.ExerciseMediaService])
], StorageController);
//# sourceMappingURL=storage.controller.js.map