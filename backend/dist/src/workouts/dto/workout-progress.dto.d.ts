export declare enum ProgressStatus {
    PENDING = "pending",
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed",
    SKIPPED = "skipped",
    FAILED = "failed"
}
export declare class StandardExerciseProgress {
    setsCompleted: number;
    repsCompleted: number;
    weightUsed?: number;
    weightUnit?: string;
    rpe?: number;
    notes?: string;
}
export declare class EMOMExerciseProgress {
    repsPerMinute: number[];
    rpe?: number;
    notes?: string;
}
export declare class AMRAPExerciseProgress {
    totalReps: number;
    rpe?: number;
    notes?: string;
}
export declare class CircuitExerciseProgress {
    roundsCompleted: number;
    totalReps: number;
    weightUsed?: number;
    weightUnit?: string;
    rpe?: number;
    notes?: string;
}
export declare class ExerciseProgressLog {
    exerciseInstanceId: string;
    exerciseName: string;
    status: ProgressStatus;
    progress?: StandardExerciseProgress | EMOMExerciseProgress | AMRAPExerciseProgress | CircuitExerciseProgress;
    videoMediaId?: string;
    durationSeconds?: number;
    tags?: string[];
    completedAt?: number;
}
export declare class SessionProgressSubmission {
    sessionId: string;
    exercises: ExerciseProgressLog[];
    overallNotes?: string;
    totalDurationMinutes?: number;
    sessionStatus: ProgressStatus;
    difficulty?: number;
    energyLevel?: number;
    issues?: string[];
}
export declare class QuickExerciseLog {
    exerciseInstanceId: string;
    status: ProgressStatus;
    repsCompleted?: number;
    setsCompleted?: number;
    rpe?: number;
    notes?: string;
}
