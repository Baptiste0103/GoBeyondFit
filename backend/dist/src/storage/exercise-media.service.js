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
exports.ExerciseMediaService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const video_compression_service_1 = require("./video-compression.service");
let ExerciseMediaService = class ExerciseMediaService {
    prisma;
    videoCompression;
    constructor(prisma, videoCompression) {
        this.prisma = prisma;
        this.videoCompression = videoCompression;
    }
    async saveVideoToProgress(progressId, studentId, videoBuffer, mimeType = 'video/mp4') {
        const progress = await this.prisma.sessionProgress.findUnique({
            where: { id: progressId },
            include: { session: true },
        });
        if (!progress) {
            throw new common_1.NotFoundException('Progress record not found');
        }
        if (progress.studentId !== studentId) {
            throw new common_1.BadRequestException('This progress record does not belong to you');
        }
        const isValidDuration = await this.videoCompression.validateDuration(videoBuffer, 40);
        if (!isValidDuration) {
            throw new common_1.BadRequestException('Video duration must not exceed 40 seconds');
        }
        const compressed = await this.videoCompression.compressVideo(videoBuffer, mimeType);
        const media = await this.prisma.exerciseMedia.create({
            data: {
                progressId,
                data: compressed.buffer,
                mimeType: compressed.mimeType,
                size: compressed.size,
            },
        });
        return {
            id: media.id,
            size: media.size,
            mimeType: media.mimeType,
            createdAt: media.createdAt,
        };
    }
    async getVideoFromProgress(mediaId, studentId) {
        const media = await this.prisma.exerciseMedia.findUnique({
            where: { id: mediaId },
            include: { progress: true },
        });
        if (!media) {
            throw new common_1.NotFoundException('Video not found');
        }
        if (media.progress.studentId !== studentId) {
            throw new common_1.BadRequestException('This video does not belong to you');
        }
        return {
            data: media.data,
            mimeType: media.mimeType,
            size: media.size,
        };
    }
    async deleteVideoFromProgress(mediaId, studentId) {
        const media = await this.prisma.exerciseMedia.findUnique({
            where: { id: mediaId },
            include: { progress: true },
        });
        if (!media) {
            throw new common_1.NotFoundException('Video not found');
        }
        if (media.progress.studentId !== studentId) {
            throw new common_1.BadRequestException('This video does not belong to you');
        }
        await this.prisma.exerciseMedia.delete({
            where: { id: mediaId },
        });
    }
    async getProgressVideos(progressId, studentId) {
        const progress = await this.prisma.sessionProgress.findUnique({
            where: { id: progressId },
        });
        if (!progress) {
            throw new common_1.NotFoundException('Progress record not found');
        }
        if (progress.studentId !== studentId) {
            throw new common_1.BadRequestException('This progress record does not belong to you');
        }
        const media = await this.prisma.exerciseMedia.findMany({
            where: { progressId },
            select: {
                id: true,
                size: true,
                mimeType: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
        });
        return media;
    }
    async getMediaStats() {
        const stats = await this.prisma.exerciseMedia.aggregate({
            _count: true,
            _sum: { size: true },
            _avg: { size: true },
        });
        return {
            totalVideos: stats._count,
            totalSize: stats._sum.size || 0,
            averageSize: Math.round(stats._avg.size || 0),
        };
    }
};
exports.ExerciseMediaService = ExerciseMediaService;
exports.ExerciseMediaService = ExerciseMediaService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        video_compression_service_1.VideoCompressionService])
], ExerciseMediaService);
//# sourceMappingURL=exercise-media.service.js.map