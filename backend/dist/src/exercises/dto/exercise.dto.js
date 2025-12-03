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
exports.ExerciseResponseDto = exports.UpdateExerciseDto = exports.CreateExerciseDto = exports.ScopeEnum = exports.ExerciseTypeEnum = void 0;
const class_validator_1 = require("class-validator");
var ExerciseTypeEnum;
(function (ExerciseTypeEnum) {
    ExerciseTypeEnum["standard"] = "standard";
    ExerciseTypeEnum["EMOM"] = "EMOM";
    ExerciseTypeEnum["AMRAP"] = "AMRAP";
    ExerciseTypeEnum["custom"] = "custom";
})(ExerciseTypeEnum || (exports.ExerciseTypeEnum = ExerciseTypeEnum = {}));
var ScopeEnum;
(function (ScopeEnum) {
    ScopeEnum["global"] = "global";
    ScopeEnum["coach"] = "coach";
})(ScopeEnum || (exports.ScopeEnum = ScopeEnum = {}));
class CreateExerciseDto {
    name;
    description;
    type;
    meta;
    scope;
    ownerId;
}
exports.CreateExerciseDto = CreateExerciseDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateExerciseDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateExerciseDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(ExerciseTypeEnum),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateExerciseDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateExerciseDto.prototype, "meta", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(ScopeEnum),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateExerciseDto.prototype, "scope", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateExerciseDto.prototype, "ownerId", void 0);
class UpdateExerciseDto {
    name;
    description;
    type;
    meta;
    scope;
}
exports.UpdateExerciseDto = UpdateExerciseDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateExerciseDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateExerciseDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(ExerciseTypeEnum),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateExerciseDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UpdateExerciseDto.prototype, "meta", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(ScopeEnum),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateExerciseDto.prototype, "scope", void 0);
class ExerciseResponseDto {
    id;
    name;
    description;
    type;
    meta;
    scope;
    ownerId;
    createdAt;
    updatedAt;
}
exports.ExerciseResponseDto = ExerciseResponseDto;
//# sourceMappingURL=exercise.dto.js.map