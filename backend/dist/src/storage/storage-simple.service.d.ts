import { PrismaService } from '../prisma/prisma.service';
export declare class StorageService {
    private prisma;
    constructor(prisma: PrismaService);
    uploadVideo(file: any, studentId: string, sessionId: string): Promise<string>;
    deleteVideo(videoUrl: string): Promise<boolean>;
    getSignedUrl(videoUrl: string): Promise<string>;
}
