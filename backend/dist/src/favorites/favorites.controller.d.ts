import { FavoritesService } from './favorites.service';
export declare class FavoritesController {
    private readonly favoritesService;
    constructor(favoritesService: FavoritesService);
    addFavorite(exerciseId: string, req: any): Promise<{
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
    removeFavorite(exerciseId: string, req: any): Promise<{
        success: boolean;
        message: string;
    }>;
    isFavorite(exerciseId: string, req: any): Promise<{
        exerciseId: string;
        isFavorited: boolean;
    }>;
}
export declare class UserFavoritesController {
    private readonly favoritesService;
    constructor(favoritesService: FavoritesService);
    getUserFavorites(page: number, limit: number, req: any): Promise<{
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
}
