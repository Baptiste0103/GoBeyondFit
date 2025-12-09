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
exports.SessionWorkoutConfig = exports.ExerciseInstanceConfig = exports.CircuitExerciseConfig = exports.AMRAPExerciseConfig = exports.EMOMExerciseConfig = exports.StandardExerciseConfig = exports.ExerciseConfigType = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
var ExerciseConfigType;
(function (ExerciseConfigType) {
    ExerciseConfigType["STANDARD"] = "standard";
    ExerciseConfigType["EMOM"] = "EMOM";
    ExerciseConfigType["AMRAP"] = "AMRAP";
    ExerciseConfigType["CIRCUIT"] = "circuit";
})(ExerciseConfigType || (exports.ExerciseConfigType = ExerciseConfigType = {}));
class StandardExerciseConfig {
    sets;
    reps;
    weight;
    weightUnit;
    notes;
}
exports.StandardExerciseConfig = StandardExerciseConfig;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], StandardExerciseConfig.prototype, "sets", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], StandardExerciseConfig.prototype, "reps", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], StandardExerciseConfig.prototype, "weight", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], StandardExerciseConfig.prototype, "weightUnit", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], StandardExerciseConfig.prototype, "notes", void 0);
class EMOMExerciseConfig {
    totalMinutes;
    repsPerMinute;
    notes;
}
exports.EMOMExerciseConfig = EMOMExerciseConfig;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    (0, class_validator_1.Max)(60),
    __metadata("design:type", Number)
], EMOMExerciseConfig.prototype, "totalMinutes", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], EMOMExerciseConfig.prototype, "repsPerMinute", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], EMOMExerciseConfig.prototype, "notes", void 0);
class AMRAPExerciseConfig {
    timeMinutes;
    targetReps;
    notes;
}
exports.AMRAPExerciseConfig = AMRAPExerciseConfig;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    (0, class_validator_1.Max)(60),
    __metadata("design:type", Number)
], AMRAPExerciseConfig.prototype, "timeMinutes", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], AMRAPExerciseConfig.prototype, "targetReps", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AMRAPExerciseConfig.prototype, "notes", void 0);
class CircuitExerciseConfig {
    rounds;
    repsPerRound;
    weight;
    weightUnit;
    restSeconds;
    notes;
}
exports.CircuitExerciseConfig = CircuitExerciseConfig;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], CircuitExerciseConfig.prototype, "rounds", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], CircuitExerciseConfig.prototype, "repsPerRound", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], CircuitExerciseConfig.prototype, "weight", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CircuitExerciseConfig.prototype, "weightUnit", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], CircuitExerciseConfig.prototype, "restSeconds", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CircuitExerciseConfig.prototype, "notes", void 0);
class ExerciseInstanceConfig {
    type;
    exerciseId;
    exerciseName;
    config;
    order;
}
exports.ExerciseInstanceConfig = ExerciseInstanceConfig;
__decorate([
    (0, class_validator_1.IsEnum)(ExerciseConfigType),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ExerciseInstanceConfig.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ExerciseInstanceConfig.prototype, "exerciseId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ExerciseInstanceConfig.prototype, "exerciseName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => StandardExerciseConfig, {
        discriminator: {
            property: 'type',
            subTypes: [{ value: StandardExerciseConfig, name: ExerciseConfigType.STANDARD }],
        },
    }),
    __metadata("design:type", Object)
], ExerciseInstanceConfig.prototype, "config", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], ExerciseInstanceConfig.prototype, "order", void 0);
class SessionWorkoutConfig {
    sessionId;
    exercises;
    notes;
    estimatedMinutes;
}
exports.SessionWorkoutConfig = SessionWorkoutConfig;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SessionWorkoutConfig.prototype, "sessionId", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ExerciseInstanceConfig),
    __metadata("design:type", Array)
], SessionWorkoutConfig.prototype, "exercises", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SessionWorkoutConfig.prototype, "notes", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], SessionWorkoutConfig.prototype, "estimatedMinutes", void 0);
//# sourceMappingURL=workout-config.dto.js.map