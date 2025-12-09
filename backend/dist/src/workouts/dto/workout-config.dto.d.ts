export declare enum ExerciseConfigType {
    STANDARD = "standard",
    EMOM = "EMOM",
    AMRAP = "AMRAP",
    CIRCUIT = "circuit"
}
export declare class StandardExerciseConfig {
    sets: number;
    reps: number;
    weight?: number;
    weightUnit?: string;
    notes?: string;
}
export declare class EMOMExerciseConfig {
    totalMinutes: number;
    repsPerMinute: number;
    notes?: string;
}
export declare class AMRAPExerciseConfig {
    timeMinutes: number;
    targetReps: number;
    notes?: string;
}
export declare class CircuitExerciseConfig {
    rounds: number;
    repsPerRound: number;
    weight?: number;
    weightUnit?: string;
    restSeconds?: number;
    notes?: string;
}
export declare class ExerciseInstanceConfig {
    type: ExerciseConfigType;
    exerciseId: string;
    exerciseName: string;
    config?: StandardExerciseConfig | EMOMExerciseConfig | AMRAPExerciseConfig | CircuitExerciseConfig;
    order?: number;
}
export declare class SessionWorkoutConfig {
    sessionId: string;
    exercises: ExerciseInstanceConfig[];
    notes?: string;
    estimatedMinutes?: number;
}
