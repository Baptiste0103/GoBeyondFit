export declare class VideoCompressionService {
    private readonly maxFileSize;
    private readonly tempDir;
    constructor();
    private ensureTempDir;
    validateVideoFile(buffer: Buffer): {
        valid: boolean;
        error?: string;
    };
    private isVideoSignature;
    compressVideo(inputBuffer: Buffer, mimeType?: string): Promise<{
        buffer: Buffer;
        mimeType: string;
        size: number;
    }>;
    private getFileExtensionFromMimeType;
    private ffmpegCompress;
    getVideoInfo(inputBuffer: Buffer): Promise<{
        duration: number;
        width: number;
        height: number;
        fps: number;
    }>;
    private parseFps;
    validateDuration(buffer: Buffer, maxDurationSeconds?: number): Promise<boolean>;
}
