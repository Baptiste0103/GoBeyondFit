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
exports.CreateExerciseDto = void 0;
const class_validator_1 = require("class-validator");
var ExerciseType;
(function (ExerciseType) {
    ExerciseType["standard"] = "standard";
    ExerciseType["EMOM"] = "EMOM";
    ExerciseType["AMRAP"] = "AMRAP";
    ExerciseType["custom"] = "custom";
})(ExerciseType || (ExerciseType = {}));
var Scope;
(function (Scope) {
    Scope["global"] = "global";
    Scope["coach"] = "coach";
})(Scope || (Scope = {}));
class CreateExerciseDto {
    name;
    description;
    type;
    difficulty;
    muscleGroups;
    instructions;
    videoUrl;
    sets;
    reps;
    meta;
    scope;
}
exports.CreateExerciseDto = CreateExerciseDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateExerciseDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateExerciseDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(ExerciseType),
    __metadata("design:type", String)
], CreateExerciseDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateExerciseDto.prototype, "difficulty", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], CreateExerciseDto.prototype, "muscleGroups", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], CreateExerciseDto.prototype, "instructions", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateExerciseDto.prototype, "videoUrl", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateExerciseDto.prototype, "sets", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateExerciseDto.prototype, "reps", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateExerciseDto.prototype, "meta", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(Scope),
    __metadata("design:type", String)
], CreateExerciseDto.prototype, "scope", void 0);
//# sourceMappingURL=create-exercise.dto.js.map