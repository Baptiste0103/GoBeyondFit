import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SessionProgressService {
  constructor(private prisma: PrismaService) {}

  /**
   * LEGACY: This service is deprecated
   * Use WorkoutRunnerService instead for all session progress operations
   */
  
  async getProgress(sessionId: string, studentId: string) {
    return this.prisma.sessionProgress.findFirst({
      where: { sessionId, studentId },
    });
  }
}
