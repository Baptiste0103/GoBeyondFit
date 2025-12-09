import { PrismaService } from '../prisma/prisma.service';
import { CreateExerciseDto, UpdateExerciseDto } from './dto';
export declare class ExerciseService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createExerciseDto: CreateExerciseDto, userId: string): Promise<{
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
    findAll(userId: string): Promise<any[]>;
    findOne(id: string, userId: string): Promise<any>;
    update(id: string, updateExerciseDto: UpdateExerciseDto, userId: string): Promise<{
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
    remove(id: string, userId: string): Promise<{
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
    searchLibrary(options: {
        search?: string;
        difficulty?: string;
        muscleGroup?: string;
        page: number;
        limit: number;
        userId: string;
    }): Promise<{
        data: any[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getCoachExercises(userId: string, options?: {
        page?: number;
        limit?: number;
        search?: string;
    }): Promise<{
        data: any[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
}
