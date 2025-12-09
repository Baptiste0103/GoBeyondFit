import { PrismaService } from '../prisma/prisma.service';
export interface FilterOptions {
    muscleGroups?: string[];
    difficulty?: string;
    searchQuery?: string;
    excludeExercises?: string[];
}
export interface DuplicateCheckResult {
    hasDuplicates: boolean;
    duplicates: Array<{
        exerciseId: string;
        exerciseName: string;
        count: number;
        positions: number[];
    }>;
}
export declare class ProgramBuilderService {
    private prisma;
    constructor(prisma: PrismaService);
    filterExercises(options: FilterOptions, page?: number, limit?: number): Promise<{
        data: {
            name: string;
            id: string;
            description: string | null;
            meta: import("@prisma/client/runtime/library").JsonValue;
        }[];
        total: number;
        page: number;
        limit: number;
        pages: number;
    }>;
    checkDuplicates(exercises: any[]): DuplicateCheckResult;
    getExercisesWithDetails(exerciseIds: string[]): Promise<Map<string, any>>;
    validateProgram(programData: any): Promise<{
        isValid: boolean;
        errors: string[];
    }>;
    cloneProgram(userId: string, originalProgramId: string, newTitle: string): Promise<{
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
    getProgramStats(programId: string): Promise<{
        programId: string;
        title: string;
        exerciseCount: number;
        blockCount: number;
        weekCount: number;
        sessionCount: number;
        estimatedDuration: string;
    }>;
    saveProgram(userId: string, programId: string, saveData: {
        title: string;
        description?: string;
        blocks: any[];
        isDraft?: boolean;
    }): Promise<{
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
    getProgramDetails(programId: string, userId: string): Promise<{
        id: string;
        title: string;
        description: string | null;
        isDraft: boolean;
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
        ownerId: string | null;
        coachId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
