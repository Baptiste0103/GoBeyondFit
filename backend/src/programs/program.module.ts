import { Module } from '@nestjs/common';
import { ProgramService } from './program.service';
import { ProgramController } from './program.controller';
import { ProgramBuilderService } from './program-builder.service';
import { ProgramBuilderController, ProgramTemplatesController } from './program-builder.controller';
import { AuditService } from './audit.service';
import { PrismaModule } from '../prisma/prisma.module';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [PrismaModule, CommonModule],
  controllers: [ProgramController, ProgramBuilderController, ProgramTemplatesController],
  providers: [ProgramService, ProgramBuilderService, AuditService],
  exports: [ProgramService, ProgramBuilderService],
})
export class ProgramModule {}
