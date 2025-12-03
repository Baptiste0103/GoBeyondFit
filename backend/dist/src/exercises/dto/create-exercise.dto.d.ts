declare enum ExerciseType {
    standard = "standard",
    EMOM = "EMOM",
    AMRAP = "AMRAP",
    custom = "custom"
}
declare enum Scope {
    global = "global",
    coach = "coach"
}
export declare class CreateExerciseDto {
    name: string;
    description?: string;
    type?: ExerciseType;
    difficulty?: string;
    muscleGroups?: string[];
    instructions?: string[];
    videoUrl?: string;
    sets?: number;
    reps?: number;
    meta?: Record<string, any>;
    scope?: Scope;
}
export {};
