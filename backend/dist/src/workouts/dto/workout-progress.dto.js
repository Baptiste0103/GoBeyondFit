"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuickExerciseLog = exports.SessionProgressSubmission = exports.ExerciseProgressLog = exports.CircuitExerciseProgress = exports.AMRAPExerciseProgress = exports.EMOMExerciseProgress = exports.StandardExerciseProgress = exports.ProgressStatus = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
var ProgressStatus;
(function (ProgressStatus) {
    ProgressStatus["PENDING"] = "pending";
    ProgressStatus["IN_PROGRESS"] = "in_progress";
    ProgressStatus["COMPLETED"] = "completed";
    ProgressStatus["SKIPPED"] = "skipped";
    ProgressStatus["FAILED"] = "failed";
})(ProgressStatus || (exports.ProgressStatus = ProgressStatus = {}));
class StandardExerciseProgress {
    setsCompleted;
    repsCompleted;
    weightUsed;
    weightUnit;
    rpe;
    notes;
}
exports.StandardExerciseProgress = StandardExerciseProgress;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], StandardExerciseProgress.prototype, "setsCompleted", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], StandardExerciseProgress.prototype, "repsCompleted", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], StandardExerciseProgress.prototype, "weightUsed", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], StandardExerciseProgress.prototype, "weightUnit", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], StandardExerciseProgress.prototype, "rpe", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], StandardExerciseProgress.prototype, "notes", void 0);
class EMOMExerciseProgress {
    repsPerMinute;
    rpe;
    notes;
}
exports.EMOMExerciseProgress = EMOMExerciseProgress;
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsNumber)({}, { each: true }),
    __metadata("design:type", Array)
], EMOMExerciseProgress.prototype, "repsPerMinute", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], EMOMExerciseProgress.prototype, "rpe", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], EMOMExerciseProgress.prototype, "notes", void 0);
class AMRAPExerciseProgress {
    totalReps;
    rpe;
    notes;
}
exports.AMRAPExerciseProgress = AMRAPExerciseProgress;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], AMRAPExerciseProgress.prototype, "totalReps", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], AMRAPExerciseProgress.prototype, "rpe", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AMRAPExerciseProgress.prototype, "notes", void 0);
class CircuitExerciseProgress {
    roundsCompleted;
    totalReps;
    weightUsed;
    weightUnit;
    rpe;
    notes;
}
exports.CircuitExerciseProgress = CircuitExerciseProgress;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], CircuitExerciseProgress.prototype, "roundsCompleted", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], CircuitExerciseProgress.prototype, "totalReps", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], CircuitExerciseProgress.prototype, "weightUsed", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CircuitExerciseProgress.prototype, "weightUnit", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], CircuitExerciseProgress.prototype, "rpe", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CircuitExerciseProgress.prototype, "notes", void 0);
class ExerciseProgressLog {
    exerciseInstanceId;
    exerciseName;
    status;
    progress;
    videoMediaId;
    durationSeconds;
    tags;
    completedAt;
}
exports.ExerciseProgressLog = ExerciseProgressLog;
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ExerciseProgressLog.prototype, "exerciseInstanceId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ExerciseProgressLog.prototype, "exerciseName", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(ProgressStatus),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ExerciseProgressLog.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => StandardExerciseProgress, {
        discriminator: {
            property: 'type',
            subTypes: [
                { value: StandardExerciseProgress, name: 'standard' },
                { value: EMOMExerciseProgress, name: 'EMOM' },
                { value: AMRAPExerciseProgress, name: 'AMRAP' },
                { value: CircuitExerciseProgress, name: 'circuit' },
            ],
        },
    }),
    __metadata("design:type", Object)
], ExerciseProgressLog.prototype, "progress", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], ExerciseProgressLog.prototype, "videoMediaId", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], ExerciseProgressLog.prototype, "durationSeconds", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], ExerciseProgressLog.prototype, "tags", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], ExerciseProgressLog.prototype, "completedAt", void 0);
class SessionProgressSubmission {
    sessionId;
    exercises;
    overallNotes;
    totalDurationMinutes;
    sessionStatus;
    difficulty;
    energyLevel;
    issues;
}
exports.SessionProgressSubmission = SessionProgressSubmission;
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SessionProgressSubmission.prototype, "sessionId", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ExerciseProgressLog),
    __metadata("design:type", Array)
], SessionProgressSubmission.prototype, "exercises", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SessionProgressSubmission.prototype, "overallNotes", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], SessionProgressSubmission.prototype, "totalDurationMinutes", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(ProgressStatus),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SessionProgressSubmission.prototype, "sessionStatus", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], SessionProgressSubmission.prototype, "difficulty", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], SessionProgressSubmission.prototype, "energyLevel", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], SessionProgressSubmission.prototype, "issues", void 0);
class QuickExerciseLog {
    exerciseInstanceId;
    status;
    repsCompleted;
    setsCompleted;
    rpe;
    notes;
}
exports.QuickExerciseLog = QuickExerciseLog;
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], QuickExerciseLog.prototype, "exerciseInstanceId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(ProgressStatus),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], QuickExerciseLog.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], QuickExerciseLog.prototype, "repsCompleted", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], QuickExerciseLog.prototype, "setsCompleted", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], QuickExerciseLog.prototype, "rpe", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QuickExerciseLog.prototype, "notes", void 0);
//# sourceMappingURL=workout-progress.dto.js.map