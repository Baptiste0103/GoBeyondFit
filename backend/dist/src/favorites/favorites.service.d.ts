import { PrismaService } from '../prisma/prisma.service';
export declare class FavoritesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    addFavorite(userId: string, exerciseId: string): Promise<{
        id: string;
        exercise: {
            id: any;
            name: any;
            description: any;
            scope: any;
            meta: any;
            owner: any;
        };
        addedAt: Date;
    }>;
    removeFavorite(userId: string, exerciseId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getUserFavorites(userId: string, page?: number, limit?: number): Promise<{
        data: {
            id: string;
            exercise: {
                id: any;
                name: any;
                description: any;
                scope: any;
                meta: any;
                owner: any;
            };
            addedAt: Date;
        }[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    isFavorite(userId: string, exerciseId: string): Promise<boolean>;
    getFavoriteIds(userId: string): Promise<string[]>;
    private formatExercise;
}
