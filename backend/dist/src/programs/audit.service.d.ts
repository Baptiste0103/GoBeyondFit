import { PrismaService } from '../prisma/prisma.service';
export declare class AuditService {
    private prisma;
    constructor(prisma: PrismaService);
    logChange(programId: string, changedBy: string, changeType: 'create' | 'update' | 'delete' | 'assign' | 'unassign', diff?: Record<string, any>): Promise<void>;
    getAuditLog(programId: string): Promise<({
        user: {
            email: string;
            pseudo: string;
            id: string;
        };
    } & {
        id: string;
        createdAt: Date;
        changeType: string;
        diff: import("@prisma/client/runtime/library").JsonValue | null;
        programId: string;
        changedBy: string;
    })[]>;
    calculateDiff(oldData: Record<string, any>, newData: Record<string, any>): Record<string, any>;
}
