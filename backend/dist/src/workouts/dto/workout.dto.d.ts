export declare class CreateSessionProgressDto {
    progress: Record<string, any>;
    notes?: string;
}
export declare class UpdateSessionProgressDto {
    progress?: Record<string, any>;
    notes?: string;
}
export declare class AddVideoDto {
    videoUrl: string;
}
export declare class CompleteSessionDto {
    notes?: string;
}
