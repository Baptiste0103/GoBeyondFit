export declare class SessionExerciseDto {
    exerciseId: string;
    position?: number;
    config?: Record<string, any>;
}
export declare class SessionDto {
    title?: string;
    notes?: string;
    date?: Date;
    position?: number;
    exercises?: SessionExerciseDto[];
}
export declare class WeekDto {
    weekNumber?: number;
    position?: number;
    sessions?: SessionDto[];
}
export declare class BlockDto {
    title?: string;
    notes?: string;
    position?: number;
    weeks?: WeekDto[];
}
export declare class CreateProgramDto {
    title: string;
    description?: string;
    isDraft?: boolean;
    blocks?: BlockDto[];
}
export declare class UpdateProgramDto {
    title?: string;
    description?: string;
    isDraft?: boolean;
}
export declare class ProgramResponseDto {
    id: string;
    title: string;
    description?: string;
    coachId: string;
    isDraft: boolean;
    createdAt: Date;
    updatedAt: Date;
}
