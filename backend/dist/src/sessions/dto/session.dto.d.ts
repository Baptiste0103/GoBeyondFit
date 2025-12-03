export declare class AddExerciseToSessionDto {
    exerciseId: string;
    config?: {
        sets?: number;
        reps?: number;
        format?: string;
        weight?: number;
        duration?: number;
        notes?: string;
    };
}
export declare class CreateSessionProgressDto {
    exerciseInstanceId: string;
    progress?: Record<string, any>;
    notes?: string;
    videos?: string[];
}
export declare class SessionProgressResponseDto {
    id: string;
    sessionId: string;
    studentId: string;
    exerciseInstanceId?: string;
    progress?: Record<string, any>;
    notes?: string;
    videos: string[];
    savedAt: Date;
}
