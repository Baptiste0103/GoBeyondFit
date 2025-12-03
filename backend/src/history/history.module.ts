import { Module } from '@nestjs/common'
import { PrismaModule } from '../prisma/prisma.module'
import { HistoryService } from './history.service'
import { HistoryController, UserHistoryController } from './history.controller'

@Module({
  imports: [PrismaModule],
  controllers: [HistoryController, UserHistoryController],
  providers: [HistoryService],
  exports: [HistoryService],
})
export class HistoryModule {}
