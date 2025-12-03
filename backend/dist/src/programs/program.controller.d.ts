import { ProgramService } from './program.service';
import { UpdateProgramDto } from './dto/program.dto';
export declare class ProgramController {
    private readonly programService;
    constructor(programService: ProgramService);
    create(body: Record<string, any>, req: Record<string, any>): Promise<{
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
    findAll(req: any): Promise<({
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
    })[] | ({
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
    })[] | ({
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
    getAssignedPrograms(studentId: string, req: any): Promise<({
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
    getAuditLog(id: string, req: any): Promise<({
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
    findById(id: string, req: any): Promise<{
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
    update(id: string, updateProgramDto: UpdateProgramDto, req: any): Promise<{
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
    delete(id: string, req: any): Promise<{
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
    assignToStudent(programId: string, studentId: string, req: any): Promise<{
        id: string;
        assignedBy: string | null;
        programId: string;
        studentId: string;
        assignedAt: Date;
    }>;
    removeAssignment(assignmentId: string, req: any): Promise<{
        id: string;
        assignedBy: string | null;
        programId: string;
        studentId: string;
        assignedAt: Date;
    }>;
}
