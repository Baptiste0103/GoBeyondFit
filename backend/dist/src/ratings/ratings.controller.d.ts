import { RatingsService } from './ratings.service';
import { CreateRatingDto, UpdateRatingDto } from './dto/rating.dto';
export declare class RatingsController {
    private readonly ratingsService;
    constructor(ratingsService: RatingsService);
    submitRating(exerciseId: string, dto: CreateRatingDto, req: any): Promise<{
        id: any;
        exerciseId: any;
        rating: any;
        comment: any;
        createdAt: any;
        updatedAt: any;
        user: any;
    }>;
    getExerciseRatings(exerciseId: string, req: any): Promise<{
        exerciseId: string;
        totalRatings: number;
        averageRating: number;
        distribution: {
            5: number;
            4: number;
            3: number;
            2: number;
            1: number;
        };
        userRating: {
            id: any;
            exerciseId: any;
            rating: any;
            comment: any;
            createdAt: any;
            updatedAt: any;
            user: any;
        } | null;
        recentRatings: {
            id: any;
            exerciseId: any;
            rating: any;
            comment: any;
            createdAt: any;
            updatedAt: any;
            user: any;
        }[];
    }>;
    getUserRating(exerciseId: string, req: any): Promise<{
        id: any;
        exerciseId: any;
        rating: any;
        comment: any;
        createdAt: any;
        updatedAt: any;
        user: any;
    } | null>;
    updateRating(exerciseId: string, ratingId: string, dto: UpdateRatingDto, req: any): Promise<{
        id: any;
        exerciseId: any;
        rating: any;
        comment: any;
        createdAt: any;
        updatedAt: any;
        user: any;
    }>;
    deleteRating(exerciseId: string, ratingId: string, req: any): Promise<{
        success: boolean;
        message: string;
    }>;
}
