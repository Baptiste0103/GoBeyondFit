import { Module } from '@nestjs/common';
import { SessionProgressService } from './session-progress.service';
import { SessionProgressController } from './session-progress.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SessionProgressController],
  providers: [SessionProgressService],
  exports: [SessionProgressService],
})
export class SessionProgressModule {}
