"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoCompressionService = void 0;
const common_1 = require("@nestjs/common");
const ffmpeg = __importStar(require("fluent-ffmpeg"));
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
let VideoCompressionService = class VideoCompressionService {
    maxFileSize = 15 * 1024 * 1024;
    tempDir = path.join(os.tmpdir(), 'gobeyondfit-videos');
    constructor() {
        this.ensureTempDir();
    }
    async ensureTempDir() {
        try {
            await fs.mkdir(this.tempDir, { recursive: true });
        }
        catch (error) {
            console.error('Failed to create temp directory:', error);
        }
    }
    validateVideoFile(buffer) {
        if (!buffer) {
            return { valid: false, error: 'Video buffer is empty' };
        }
        if (buffer.length > this.maxFileSize) {
            return {
                valid: false,
                error: `Video size ${(buffer.length / 1024 / 1024).toFixed(2)}MB exceeds 15MB limit`,
            };
        }
        const signature = buffer.slice(0, 4).toString('hex');
        if (!this.isVideoSignature(signature)) {
            console.warn(`Unknown video signature: ${signature}, allowing anyway`);
        }
        return { valid: true };
    }
    isVideoSignature(signature) {
        const videoSignatures = [
            '66747970',
            '1a45dfa3',
            '52494646',
            'ffd8ff',
        ];
        return videoSignatures.some((sig) => signature.startsWith(sig));
    }
    async compressVideo(inputBuffer, mimeType = 'video/mp4') {
        const validation = this.validateVideoFile(inputBuffer);
        if (!validation.valid) {
            throw new common_1.BadRequestException(validation.error);
        }
        const timestamp = Date.now();
        const inputExt = this.getFileExtensionFromMimeType(mimeType);
        const inputPath = path.join(this.tempDir, `input-${timestamp}${inputExt}`);
        const outputPath = path.join(this.tempDir, `output-${timestamp}.mp4`);
        try {
            console.log(`📹 [VideoCompressionService] Compressing video - Input: ${inputExt}, Size: ${(inputBuffer.length / 1024 / 1024).toFixed(2)}MB`);
            await fs.writeFile(inputPath, inputBuffer);
            await this.ffmpegCompress(inputPath, outputPath);
            const compressedBuffer = await fs.readFile(outputPath);
            const compressedSizeMB = compressedBuffer.length / 1024 / 1024;
            const originalSizeMB = inputBuffer.length / 1024 / 1024;
            console.log(`✅ [VideoCompressionService] Compression complete - Original: ${originalSizeMB.toFixed(2)}MB, Compressed: ${compressedSizeMB.toFixed(2)}MB, Ratio: ${((1 - compressedSizeMB / originalSizeMB) * 100).toFixed(1)}%`);
            return {
                buffer: compressedBuffer,
                mimeType: 'video/mp4',
                size: compressedBuffer.length,
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(`Video compression failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
        finally {
            try {
                await Promise.all([fs.unlink(inputPath), fs.unlink(outputPath)].map((p) => p.catch(() => { })));
            }
            catch (e) {
                console.warn('Failed to cleanup temp files:', e);
            }
        }
    }
    getFileExtensionFromMimeType(mimeType) {
        const mimeMap = {
            'video/mp4': '.mp4',
            'video/quicktime': '.mov',
            'video/x-msvideo': '.avi',
            'video/webm': '.webm',
        };
        return mimeMap[mimeType] || '.mp4';
    }
    ffmpegCompress(inputPath, outputPath) {
        return new Promise((resolve, reject) => {
            ffmpeg(inputPath)
                .videoCodec('libx264')
                .audioCodec('aac')
                .size('854x480')
                .fps(24)
                .audioBitrate('128k')
                .videoBitrate('1024k')
                .on('error', (err) => {
                console.error('ffmpeg error:', err);
                reject(err);
            })
                .on('end', () => {
                resolve();
            })
                .save(outputPath);
        });
    }
    async getVideoInfo(inputBuffer) {
        const inputPath = path.join(this.tempDir, `info-${Date.now()}.mp4`);
        try {
            await fs.writeFile(inputPath, inputBuffer);
            return new Promise((resolve, reject) => {
                ffmpeg.ffprobe(inputPath, (err, metadata) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    const video = metadata.streams.find((s) => s.codec_type === 'video') || {};
                    const audio = metadata.streams.find((s) => s.codec_type === 'audio') || {};
                    resolve({
                        duration: metadata.format.duration || 0,
                        width: video.width || 0,
                        height: video.height || 0,
                        fps: this.parseFps(video.r_frame_rate || '24/1'),
                    });
                });
            });
        }
        finally {
            try {
                await fs.unlink(inputPath);
            }
            catch (e) {
                console.warn('Failed to cleanup video info temp file:', e);
            }
        }
    }
    parseFps(fpsStr) {
        if (!fpsStr || typeof fpsStr !== 'string') {
            return 24;
        }
        const [numerator, denominator] = fpsStr.split('/').map(Number);
        if (!numerator || !denominator) {
            return 24;
        }
        return numerator / denominator;
    }
    async validateDuration(buffer, maxDurationSeconds = 40) {
        try {
            const info = await this.getVideoInfo(buffer);
            return info.duration <= maxDurationSeconds;
        }
        catch (error) {
            console.warn('Failed to get video duration:', error);
            return true;
        }
    }
};
exports.VideoCompressionService = VideoCompressionService;
exports.VideoCompressionService = VideoCompressionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], VideoCompressionService);
//# sourceMappingURL=video-compression.service.js.map