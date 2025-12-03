import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  /**
   * Log a program change to ProgramAudit
   */
  async logChange(
    programId: string,
    changedBy: string,
    changeType: 'create' | 'update' | 'delete' | 'assign' | 'unassign',
    diff?: Record<string, any>,
  ) {
    try {
      await this.prisma.programAudit.create({
        data: {
          programId,
          changedBy,
          changeType,
          diff: diff || {},
        },
      });
    } catch (error) {
      // Log error but don't fail the main operation
      console.error(`[AuditService] Failed to log change: ${error}`);
    }
  }

  /**
   * Get audit logs for a program
   */
  async getAuditLog(programId: string) {
    return this.prisma.programAudit.findMany({
      where: { programId },
      include: { user: { select: { id: true, pseudo: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Calculate diff between old and new data
   */
  calculateDiff(oldData: Record<string, any>, newData: Record<string, any>): Record<string, any> {
    const diff: Record<string, any> = {};

    // Check what changed
    for (const key in newData) {
      if (oldData[key] !== newData[key]) {
        diff[key] = {
          before: oldData[key],
          after: newData[key],
        };
      }
    }

    // Check what was removed
    for (const key in oldData) {
      if (!(key in newData)) {
        diff[key] = {
          before: oldData[key],
          after: null,
        };
      }
    }

    return diff;
  }
}
