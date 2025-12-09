import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { VideoCompressionService } from './video-compression.service';

export interface SaveVideoProgressDto {
  video: Buffer;
  mimeType: string;
}

@Injectable()
export class ExerciseMediaService {
  constructor(
    private prisma: PrismaService,
    private videoCompression: VideoCompressionService,
  ) {}

  /**
   * Save compressed video to progress record
   */
  async saveVideoToProgress(
    progressId: string,
    studentId: string,
    videoBuffer: Buffer,
    mimeType: string = 'video/mp4',
  ): Promise<any> {
    // Verify progress exists and belongs to student
    const progress = await this.prisma.sessionProgress.findUnique({
      where: { id: progressId },
      include: { session: true },
    });

    if (!progress) {
      throw new NotFoundException('Progress record not found');
    }

    if (progress.studentId !== studentId) {
      throw new BadRequestException('This progress record does not belong to you');
    }

    // Validate video duration (max 40 seconds)
    const isValidDuration = await this.videoCompression.validateDuration(videoBuffer, 40);
    if (!isValidDuration) {
      throw new BadRequestException('Video duration must not exceed 40 seconds');
    }

    // Compress video
    const compressed = await this.videoCompression.compressVideo(videoBuffer, mimeType);

    // Save to database
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

  /**
   * Get video from progress record
   */
  async getVideoFromProgress(mediaId: string, studentId: string): Promise<any> {
    const media = await this.prisma.exerciseMedia.findUnique({
      where: { id: mediaId },
      include: { progress: true },
    });

    if (!media) {
      throw new NotFoundException('Video not found');
    }

    if (media.progress.studentId !== studentId) {
      throw new BadRequestException('This video does not belong to you');
    }

    return {
      data: media.data,
      mimeType: media.mimeType,
      size: media.size,
    };
  }

  /**
   * Delete video from progress record
   */
  async deleteVideoFromProgress(mediaId: string, studentId: string): Promise<void> {
    const media = await this.prisma.exerciseMedia.findUnique({
      where: { id: mediaId },
      include: { progress: true },
    });

    if (!media) {
      throw new NotFoundException('Video not found');
    }

    if (media.progress.studentId !== studentId) {
      throw new BadRequestException('This video does not belong to you');
    }

    await this.prisma.exerciseMedia.delete({
      where: { id: mediaId },
    });
  }

  /**
   * Get all videos for a progress record
   */
  async getProgressVideos(progressId: string, studentId: string): Promise<any[]> {
    const progress = await this.prisma.sessionProgress.findUnique({
      where: { id: progressId },
    });

    if (!progress) {
      throw new NotFoundException('Progress record not found');
    }

    if (progress.studentId !== studentId) {
      throw new BadRequestException('This progress record does not belong to you');
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

  /**
   * Get database stats on media storage
   */
  async getMediaStats(): Promise<{
    totalVideos: number;
    totalSize: number;
    averageSize: number;
  }> {
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
}
