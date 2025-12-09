import { ExerciseService } from './exercise.service';
import { CreateExerciseDto, UpdateExerciseDto } from './dto';
export declare class ExerciseController {
    private readonly exerciseService;
    constructor(exerciseService: ExerciseService);
    create(createExerciseDto: CreateExerciseDto, req: any): Promise<{
        owner: {
            pseudo: string;
            firstName: string | null;
            lastName: string | null;
            id: string;
        } | null;
    } & {
        type: import(".prisma/client").$Enums.ExerciseType;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        meta: import("@prisma/client/runtime/library").JsonValue | null;
        scope: import(".prisma/client").$Enums.Scope;
        ownerId: string | null;
    }>;
    searchLibrary(req: any, search?: string, difficulty?: string, muscleGroup?: string, page?: number, limit?: number): Promise<{
        data: any[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findAll(req: any): Promise<any[]>;
    findOne(id: string, req: any): Promise<any>;
    update(id: string, updateExerciseDto: UpdateExerciseDto, req: any): Promise<{
        owner: {
            pseudo: string;
            firstName: string | null;
            lastName: string | null;
            id: string;
        } | null;
    } & {
        type: import(".prisma/client").$Enums.ExerciseType;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        meta: import("@prisma/client/runtime/library").JsonValue | null;
        scope: import(".prisma/client").$Enums.Scope;
        ownerId: string | null;
    }>;
    getCoachExercises(req: any, page?: number, limit?: number, search?: string): Promise<{
        data: any[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    remove(id: string, req: any): Promise<{
        type: import(".prisma/client").$Enums.ExerciseType;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        meta: import("@prisma/client/runtime/library").JsonValue | null;
        scope: import(".prisma/client").$Enums.Scope;
        ownerId: string | null;
    }>;
}
