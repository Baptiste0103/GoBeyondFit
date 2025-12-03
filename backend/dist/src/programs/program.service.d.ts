import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from './audit.service';
export declare class ProgramService {
    private prisma;
    private auditService;
    constructor(prisma: PrismaService, auditService: AuditService);
    createProgram(data: any, coachId: string): Promise<{
        blocks: ({
            weeks: ({
                sessions: ({
                    exercises: ({
                        exercise: {
                            type: import(".prisma/client").$Enums.ExerciseType;
                            name: string;
                            id: string;
                            createdAt: Date;
                            updatedAt: Date;
                            description: string | null;
                            meta: import("@prisma/client/runtime/library").JsonValue | null;
                            scope: import(".prisma/client").$Enums.Scope;
                            ownerId: string | null;
                        };
                    } & {
                        id: string;
                        exerciseId: string;
                        position: number;
                        config: import("@prisma/client/runtime/library").JsonValue | null;
                        sessionId: string;
                    })[];
                } & {
                    id: string;
                    data: import("@prisma/client/runtime/library").JsonValue | null;
                    title: string | null;
                    position: number;
                    notes: string | null;
                    date: Date | null;
                    weekId: string;
                })[];
            } & {
                id: string;
                position: number;
                weekNumber: number;
                blockId: string;
            })[];
        } & {
            id: string;
            title: string | null;
            position: number;
            notes: string | null;
            programId: string;
        })[];
    } & {
        id: string;
        coachId: string;
        createdAt: Date;
        updatedAt: Date;
        data: import("@prisma/client/runtime/library").JsonValue | null;
        description: string | null;
        ownerId: string | null;
        title: string;
        isDraft: boolean;
    }>;
    findByCoach(coachId: string): Promise<({
        blocks: ({
            weeks: ({
                sessions: {
                    id: string;
                    data: import("@prisma/client/runtime/library").JsonValue | null;
                    title: string | null;
                    position: number;
                    notes: string | null;
                    date: Date | null;
                    weekId: string;
                }[];
            } & {
                id: string;
                position: number;
                weekNumber: number;
                blockId: string;
            })[];
        } & {
            id: string;
            title: string | null;
            position: number;
            notes: string | null;
            programId: string;
        })[];
        assignments: {
            id: string;
            assignedBy: string | null;
            programId: string;
            studentId: string;
            assignedAt: Date;
        }[];
    } & {
        id: string;
        coachId: string;
        createdAt: Date;
        updatedAt: Date;
        data: import("@prisma/client/runtime/library").JsonValue | null;
        description: string | null;
        ownerId: string | null;
        title: string;
        isDraft: boolean;
    })[]>;
    findById(id: string, userId: string): Promise<{
        coach: {
            email: string;
            pseudo: string;
            id: string;
        };
        blocks: ({
            weeks: ({
                sessions: ({
                    exercises: ({
                        exercise: {
                            type: import(".prisma/client").$Enums.ExerciseType;
                            name: string;
                            id: string;
                            createdAt: Date;
                            updatedAt: Date;
                            description: string | null;
                            meta: import("@prisma/client/runtime/library").JsonValue | null;
                            scope: import(".prisma/client").$Enums.Scope;
                            ownerId: string | null;
                        };
                    } & {
                        id: string;
                        exerciseId: string;
                        position: number;
                        config: import("@prisma/client/runtime/library").JsonValue | null;
                        sessionId: string;
                    })[];
                } & {
                    id: string;
                    data: import("@prisma/client/runtime/library").JsonValue | null;
                    title: string | null;
                    position: number;
                    notes: string | null;
                    date: Date | null;
                    weekId: string;
                })[];
            } & {
                id: string;
                position: number;
                weekNumber: number;
                blockId: string;
            })[];
        } & {
            id: string;
            title: string | null;
            position: number;
            notes: string | null;
            programId: string;
        })[];
        assignments: {
            id: string;
            assignedBy: string | null;
            programId: string;
            studentId: string;
            assignedAt: Date;
        }[];
    } & {
        id: string;
        coachId: string;
        createdAt: Date;
        updatedAt: Date;
        data: import("@prisma/client/runtime/library").JsonValue | null;
        description: string | null;
        ownerId: string | null;
        title: string;
        isDraft: boolean;
    }>;
    findAll(): Promise<({
        coach: {
            email: string;
            pseudo: string;
            password: string;
            firstName: string | null;
            lastName: string | null;
            role: import(".prisma/client").$Enums.Role;
            profileUrl: string | null;
            id: string;
            coachId: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
        blocks: {
            id: string;
            title: string | null;
            position: number;
            notes: string | null;
            programId: string;
        }[];
        assignments: {
            id: string;
            assignedBy: string | null;
            programId: string;
            studentId: string;
            assignedAt: Date;
        }[];
    } & {
        id: string;
        coachId: string;
        createdAt: Date;
        updatedAt: Date;
        data: import("@prisma/client/runtime/library").JsonValue | null;
        description: string | null;
        ownerId: string | null;
        title: string;
        isDraft: boolean;
    })[]>;
    update(id: string, data: any, coachId: string): Promise<{
        coach: {
            email: string;
            pseudo: string;
            id: string;
        };
        blocks: ({
            weeks: ({
                sessions: ({
                    exercises: ({
                        exercise: {
                            type: import(".prisma/client").$Enums.ExerciseType;
                            name: string;
                            id: string;
                            createdAt: Date;
                            updatedAt: Date;
                            description: string | null;
                            meta: import("@prisma/client/runtime/library").JsonValue | null;
                            scope: import(".prisma/client").$Enums.Scope;
                            ownerId: string | null;
                        };
                    } & {
                        id: string;
                        exerciseId: string;
                        position: number;
                        config: import("@prisma/client/runtime/library").JsonValue | null;
                        sessionId: string;
                    })[];
                } & {
                    id: string;
                    data: import("@prisma/client/runtime/library").JsonValue | null;
                    title: string | null;
                    position: number;
                    notes: string | null;
                    date: Date | null;
                    weekId: string;
                })[];
            } & {
                id: string;
                position: number;
                weekNumber: number;
                blockId: string;
            })[];
        } & {
            id: string;
            title: string | null;
            position: number;
            notes: string | null;
            programId: string;
        })[];
        assignments: {
            id: string;
            assignedBy: string | null;
            programId: string;
            studentId: string;
            assignedAt: Date;
        }[];
    } & {
        id: string;
        coachId: string;
        createdAt: Date;
        updatedAt: Date;
        data: import("@prisma/client/runtime/library").JsonValue | null;
        description: string | null;
        ownerId: string | null;
        title: string;
        isDraft: boolean;
    }>;
    delete(id: string, coachId: string): Promise<{
        id: string;
        coachId: string;
        createdAt: Date;
        updatedAt: Date;
        data: import("@prisma/client/runtime/library").JsonValue | null;
        description: string | null;
        ownerId: string | null;
        title: string;
        isDraft: boolean;
    }>;
    getAssignedPrograms(studentId: string): Promise<({
        coach: {
            email: string;
            pseudo: string;
        };
        blocks: ({
            weeks: ({
                sessions: ({
                    exercises: ({
                        exercise: {
                            type: import(".prisma/client").$Enums.ExerciseType;
                            name: string;
                            id: string;
                            createdAt: Date;
                            updatedAt: Date;
                            description: string | null;
                            meta: import("@prisma/client/runtime/library").JsonValue | null;
                            scope: import(".prisma/client").$Enums.Scope;
                            ownerId: string | null;
                        };
                    } & {
                        id: string;
                        exerciseId: string;
                        position: number;
                        config: import("@prisma/client/runtime/library").JsonValue | null;
                        sessionId: string;
                    })[];
                } & {
                    id: string;
                    data: import("@prisma/client/runtime/library").JsonValue | null;
                    title: string | null;
                    position: number;
                    notes: string | null;
                    date: Date | null;
                    weekId: string;
                })[];
            } & {
                id: string;
                position: number;
                weekNumber: number;
                blockId: string;
            })[];
        } & {
            id: string;
            title: string | null;
            position: number;
            notes: string | null;
            programId: string;
        })[];
    } & {
        id: string;
        coachId: string;
        createdAt: Date;
        updatedAt: Date;
        data: import("@prisma/client/runtime/library").JsonValue | null;
        description: string | null;
        ownerId: string | null;
        title: string;
        isDraft: boolean;
    })[]>;
    assignToStudent(programId: string, studentId: string, coachId: string): Promise<{
        id: string;
        assignedBy: string | null;
        programId: string;
        studentId: string;
        assignedAt: Date;
    }>;
    removeAssignment(assignmentId: string, coachId: string): Promise<{
        id: string;
        assignedBy: string | null;
        programId: string;
        studentId: string;
        assignedAt: Date;
    }>;
    getAuditLog(programId: string, coachId: string): Promise<({
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
}
