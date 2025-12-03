import { Module } from '@nestjs/common';
import { StorageService } from './storage-simple.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [StorageService],
  exports: [StorageService],
})
export class StorageModule {}
