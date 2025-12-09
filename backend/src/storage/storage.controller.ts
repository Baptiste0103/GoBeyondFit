import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  UseGuards,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  Res,
  UseInterceptors,
  UploadedFile,
  Request,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ExerciseMediaService } from './exercise-media.service';

@Controller('storage')
@UseGuards(JwtAuthGuard)
export class StorageController {
  constructor(private readonly exerciseMediaService: ExerciseMediaService) {}

  @Post('progress/:progressId/video')
  @UseInterceptors(FileInterceptor('video', { limits: { fileSize: 100 * 1024 * 1024 } }))
  async uploadProgressVideo(
    @Param('progressId') progressId: string,
    @UploadedFile() file: any,
    @Request() req: any,
  ) {
    if (!file) {
      throw new BadRequestException('No video file provided');
    }

    const userId = req.user?.id;
    if (!userId) {
      throw new ForbiddenException('User not authenticated');
    }

    console.log(`📹 [StorageController] Video upload started for progressId: ${progressId}`);
    console.log(`📹 [StorageController] File: ${file.originalname}, MIME: ${file.mimetype}, Size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);

    try {
      const media = await this.exerciseMediaService.saveVideoToProgress(
        progressId,
        userId,
        file.buffer,
        file.mimetype,
      );

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
    } catch (error) {
      console.error(`❌ [StorageController] Video upload failed:`, error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Failed to process video: ${error.message}`);
    }
  }

  @Get('progress/:progressId/videos')
  async getProgressVideos(
    @Param('progressId') progressId: string,
    @Request() req: any,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new ForbiddenException('User not authenticated');
    }

    try {
      const videos = await this.exerciseMediaService.getProgressVideos(
        progressId,
        userId,
      );

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
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new BadRequestException(`Failed to retrieve videos: ${error.message}`);
    }
  }

  @Get('videos/:mediaId')
  async downloadVideo(
    @Param('mediaId') mediaId: string,
    @Request() req: any,
    @Res() res: Response,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new ForbiddenException('User not authenticated');
    }

    try {
      const media = await this.exerciseMediaService.getVideoFromProgress(
        mediaId,
        userId,
      );

      if (!media) {
        throw new NotFoundException('Video not found');
      }

      res.set({
        'Content-Type': media.mimeType,
        'Content-Length': media.size,
        'Content-Disposition': `attachment; filename="video-${mediaId}.mp4"`,
      });

      res.send(media.data);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new BadRequestException(`Failed to download video: ${error.message}`);
    }
  }

  @Delete('videos/:mediaId')
  async deleteVideo(
    @Param('mediaId') mediaId: string,
    @Request() req: any,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new ForbiddenException('User not authenticated');
    }

    try {
      await this.exerciseMediaService.deleteVideoFromProgress(mediaId, userId);

      return {
        success: true,
        message: 'Video deleted successfully',
      };
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new BadRequestException(`Failed to delete video: ${error.message}`);
    }
  }

  @Get('stats')
  async getMediaStats() {
    try {
      const stats = await this.exerciseMediaService.getMediaStats();

      return {
        success: true,
        stats,
      };
    } catch (error) {
      throw new BadRequestException(`Failed to retrieve stats: ${error.message}`);
    }
  }
}
