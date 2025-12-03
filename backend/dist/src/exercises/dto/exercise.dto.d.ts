export declare enum ExerciseTypeEnum {
    standard = "standard",
    EMOM = "EMOM",
    AMRAP = "AMRAP",
    custom = "custom"
}
export declare enum ScopeEnum {
    global = "global",
    coach = "coach"
}
export declare class CreateExerciseDto {
    name: string;
    description?: string;
    type: ExerciseTypeEnum;
    meta?: Record<string, any>;
    scope: ScopeEnum;
    ownerId?: string;
}
export declare class UpdateExerciseDto {
    name?: string;
    description?: string;
    type?: ExerciseTypeEnum;
    meta?: Record<string, any>;
    scope?: ScopeEnum;
}
export declare class ExerciseResponseDto {
    id: string;
    name: string;
    description?: string;
    type: ExerciseTypeEnum;
    meta?: Record<string, any>;
    scope: ScopeEnum;
    ownerId?: string;
    createdAt: Date;
    updatedAt: Date;
}
