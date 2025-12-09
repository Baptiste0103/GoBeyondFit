import type { Response } from 'express';
import { ExerciseMediaService } from './exercise-media.service';
export declare class StorageController {
    private readonly exerciseMediaService;
    constructor(exerciseMediaService: ExerciseMediaService);
    uploadProgressVideo(progressId: string, file: any, req: any): Promise<{
        success: boolean;
        media: {
            id: any;
            size: any;
            mimeType: any;
            createdAt: any;
        };
    }>;
    getProgressVideos(progressId: string, req: any): Promise<{
        success: boolean;
        count: number;
        videos: {
            id: any;
            size: any;
            mimeType: any;
            createdAt: any;
        }[];
    }>;
    downloadVideo(mediaId: string, req: any, res: Response): Promise<void>;
    deleteVideo(mediaId: string, req: any): Promise<{
        success: boolean;
        message: string;
    }>;
    getMediaStats(): Promise<{
        success: boolean;
        stats: {
            totalVideos: number;
            totalSize: number;
            averageSize: number;
        };
    }>;
}
