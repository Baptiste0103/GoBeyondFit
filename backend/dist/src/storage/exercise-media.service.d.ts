import { PrismaService } from '../prisma/prisma.service';
import { VideoCompressionService } from './video-compression.service';
export interface SaveVideoProgressDto {
    video: Buffer;
    mimeType: string;
}
export declare class ExerciseMediaService {
    private prisma;
    private videoCompression;
    constructor(prisma: PrismaService, videoCompression: VideoCompressionService);
    saveVideoToProgress(progressId: string, studentId: string, videoBuffer: Buffer, mimeType?: string): Promise<any>;
    getVideoFromProgress(mediaId: string, studentId: string): Promise<any>;
    deleteVideoFromProgress(mediaId: string, studentId: string): Promise<void>;
    getProgressVideos(progressId: string, studentId: string): Promise<any[]>;
    getMediaStats(): Promise<{
        totalVideos: number;
        totalSize: number;
        averageSize: number;
    }>;
}
