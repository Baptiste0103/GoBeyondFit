import { ProgramBuilderService, DuplicateCheckResult } from './program-builder.service';
export declare class ProgramBuilderController {
    private readonly builderService;
    constructor(builderService: ProgramBuilderService);
    filterExercises(page?: number, limit?: number, muscleGroups?: string, difficulty?: string, search?: string, exclude?: string): Promise<{
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
    validateProgram(programData: any): Promise<{
        isValid: boolean;
        errors: string[];
    }>;
    checkDuplicates({ exercises }: {
        exercises: any[];
    }): Promise<DuplicateCheckResult>;
    cloneProgram(programId: string, { title }: {
        title: string;
    }, req: any): Promise<{
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
    getProgramDetails(programId: string, req: any): Promise<{
        id: string;
        title: string;
        description: string | null;
        isDraft: boolean;
        blocks: string | number | true | import("@prisma/client/runtime/library").JsonObject | import("@prisma/client/runtime/library").JsonArray;
        ownerId: string | null;
        coachId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    saveProgram(programId: string, saveData: {
        title: string;
        description?: string;
        blocks: any[];
        isDraft?: boolean;
    }, req: any): Promise<{
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
}
export declare class ProgramTemplatesController {
    private readonly builderService;
    constructor(builderService: ProgramBuilderService);
    createFromTemplate(templateId: string, { title, customizations }: {
        title: string;
        customizations?: any;
    }, req: any): Promise<{
        message: string;
        title: string;
        template: string;
    }>;
}
