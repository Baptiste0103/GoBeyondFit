import { Injectable, BadRequestException } from '@nestjs/common';
import * as ffmpeg from 'fluent-ffmpeg';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import { Readable } from 'stream';

@Injectable()
export class VideoCompressionService {
  private readonly maxFileSize = 15 * 1024 * 1024; // 15MB
  private readonly tempDir = path.join(os.tmpdir(), 'gobeyondfit-videos');

  constructor() {
    // Ensure temp directory exists
    this.ensureTempDir();
  }

  private async ensureTempDir() {
    try {
      await fs.mkdir(this.tempDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create temp directory:', error);
    }
  }

  /**
   * Validate video file before compression
   */
  validateVideoFile(buffer: Buffer): { valid: boolean; error?: string } {
    if (!buffer) {
      return { valid: false, error: 'Video buffer is empty' };
    }

    if (buffer.length > this.maxFileSize) {
      return {
        valid: false,
        error: `Video size ${(buffer.length / 1024 / 1024).toFixed(2)}MB exceeds 15MB limit`,
      };
    }

    // Check for video file signature (very basic check)
    const signature = buffer.slice(0, 4).toString('hex');
    if (!this.isVideoSignature(signature)) {
      console.warn(`Unknown video signature: ${signature}, allowing anyway`);
    }

    return { valid: true };
  }

  /**
   * Check if buffer has known video file signature
   */
  private isVideoSignature(signature: string): boolean {
    const videoSignatures = [
      '66747970', // ftyp (MP4)
      '1a45dfa3', // EBML (WebM)
      '52494646', // RIFF (AVI/WAV)
      'ffd8ff', // JPEG
    ];

    return videoSignatures.some((sig) => signature.startsWith(sig));
  }

  /**
   * Compress video to target specs: 480p, 24fps, 1Mbps
   * Supports: MP4, MOV, AVI input formats
   * Input: Buffer
   * Output: Buffer (compressed MP4)
   */
  async compressVideo(inputBuffer: Buffer, mimeType: string = 'video/mp4'): Promise<{
    buffer: Buffer;
    mimeType: string;
    size: number;
  }> {
    // Validate input
    const validation = this.validateVideoFile(inputBuffer);
    if (!validation.valid) {
      throw new BadRequestException(validation.error);
    }

    // Generate unique temp filenames
    const timestamp = Date.now();
    const inputExt = this.getFileExtensionFromMimeType(mimeType);
    const inputPath = path.join(this.tempDir, `input-${timestamp}${inputExt}`);
    const outputPath = path.join(this.tempDir, `output-${timestamp}.mp4`);

    try {
      // Write input buffer to temp file
      console.log(`📹 [VideoCompressionService] Compressing video - Input: ${inputExt}, Size: ${(inputBuffer.length / 1024 / 1024).toFixed(2)}MB`);
      await fs.writeFile(inputPath, inputBuffer);

      // Compress with ffmpeg
      await this.ffmpegCompress(inputPath, outputPath);

      // Read compressed output
      const compressedBuffer = await fs.readFile(outputPath);
      const compressedSizeMB = compressedBuffer.length / 1024 / 1024;
      const originalSizeMB = inputBuffer.length / 1024 / 1024;
      
      console.log(`✅ [VideoCompressionService] Compression complete - Original: ${originalSizeMB.toFixed(2)}MB, Compressed: ${compressedSizeMB.toFixed(2)}MB, Ratio: ${((1 - compressedSizeMB / originalSizeMB) * 100).toFixed(1)}%`);

      return {
        buffer: compressedBuffer,
        mimeType: 'video/mp4',
        size: compressedBuffer.length,
      };
    } catch (error) {
      throw new BadRequestException(
        `Video compression failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    } finally {
      // Cleanup temp files
      try {
        await Promise.all([fs.unlink(inputPath), fs.unlink(outputPath)].map((p) =>
          p.catch(() => {}),
        ));
      } catch (e) {
        console.warn('Failed to cleanup temp files:', e);
      }
    }
  }

  /**
   * Get file extension from MIME type
   */
  private getFileExtensionFromMimeType(mimeType: string): string {
    const mimeMap: { [key: string]: string } = {
      'video/mp4': '.mp4',
      'video/quicktime': '.mov',
      'video/x-msvideo': '.avi',
      'video/webm': '.webm',
    };
    return mimeMap[mimeType] || '.mp4';
  }

  /**
   * Internal ffmpeg compression logic
   */
  private ffmpegCompress(inputPath: string, outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .videoCodec('libx264') // H.264 codec
        .audioCodec('aac') // AAC audio
        .size('854x480') // 480p resolution
        .fps(24) // 24 frames per second
        .audioBitrate('128k') // Audio bitrate
        .videoBitrate('1024k') // 1Mbps video bitrate
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

  /**
   * Get video info without compression (for preview/stats)
   */
  async getVideoInfo(inputBuffer: Buffer): Promise<{
    duration: number;
    width: number;
    height: number;
    fps: number;
  }> {
    const inputPath = path.join(this.tempDir, `info-${Date.now()}.mp4`);

    try {
      await fs.writeFile(inputPath, inputBuffer);

      return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(inputPath, (err, metadata) => {
          if (err) {
            reject(err);
            return;
          }

          const video = metadata.streams.find((s: any) => s.codec_type === 'video') || {};
          const audio = metadata.streams.find((s: any) => s.codec_type === 'audio') || {};

          resolve({
            duration: metadata.format.duration || 0,
            width: video.width || 0,
            height: video.height || 0,
            fps: this.parseFps(video.r_frame_rate || '24/1'),
          });
        });
      });
    } finally {
      try {
        await fs.unlink(inputPath);
      } catch (e) {
        console.warn('Failed to cleanup video info temp file:', e);
      }
    }
  }

  /**
   * Parse fps from string like "24/1" or "60000/1001"
   */
  private parseFps(fpsStr: string): number {
    if (!fpsStr || typeof fpsStr !== 'string') {
      return 24;
    }

    const [numerator, denominator] = fpsStr.split('/').map(Number);
    if (!numerator || !denominator) {
      return 24;
    }

    return numerator / denominator;
  }

  /**
   * Validate video duration (max 40 seconds)
   */
  async validateDuration(buffer: Buffer, maxDurationSeconds: number = 40): Promise<boolean> {
    try {
      const info = await this.getVideoInfo(buffer);
      return info.duration <= maxDurationSeconds;
    } catch (error) {
      console.warn('Failed to get video duration:', error);
      // If we can't determine duration, allow it to proceed
      return true;
    }
  }
}
