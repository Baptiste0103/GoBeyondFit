import { PrismaService } from '../prisma/prisma.service';
import { CreateRatingDto, UpdateRatingDto } from './dto/rating.dto';
export declare class RatingsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createOrUpdateRating(exerciseId: string, userId: string, dto: CreateRatingDto): Promise<{
        id: any;
        exerciseId: any;
        rating: any;
        comment: any;
        createdAt: any;
        updatedAt: any;
        user: any;
    }>;
    getExerciseRatings(exerciseId: string, userId: string): Promise<{
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
    getUserRating(exerciseId: string, userId: string): Promise<{
        id: any;
        exerciseId: any;
        rating: any;
        comment: any;
        createdAt: any;
        updatedAt: any;
        user: any;
    } | null>;
    updateRating(ratingId: string, userId: string, exerciseId: string, dto: UpdateRatingDto): Promise<{
        id: any;
        exerciseId: any;
        rating: any;
        comment: any;
        createdAt: any;
        updatedAt: any;
        user: any;
    }>;
    deleteRating(ratingId: string, userId: string, exerciseId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    private formatRating;
}
