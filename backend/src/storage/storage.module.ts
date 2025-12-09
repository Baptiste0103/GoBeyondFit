import { Module } from '@nestjs/common';
import { StorageService } from './storage-simple.service';
import { VideoCompressionService } from './video-compression.service';
import { ExerciseMediaService } from './exercise-media.service';
import { StorageController } from './storage.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [StorageController],
  providers: [StorageService, VideoCompressionService, ExerciseMediaService],
  exports: [StorageService, VideoCompressionService, ExerciseMediaService],
})
export class StorageModule {}
