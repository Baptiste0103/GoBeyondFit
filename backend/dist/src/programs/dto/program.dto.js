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
exports.ProgramResponseDto = exports.UpdateProgramDto = exports.CreateProgramDto = exports.BlockDto = exports.WeekDto = exports.SessionDto = exports.SessionExerciseDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class SessionExerciseDto {
    exerciseId;
    position;
    config;
}
exports.SessionExerciseDto = SessionExerciseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Exercise ID' }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SessionExerciseDto.prototype, "exerciseId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Position in session', example: 0 }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], SessionExerciseDto.prototype, "position", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Exercise config (sets, reps, weights)' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], SessionExerciseDto.prototype, "config", void 0);
class SessionDto {
    title;
    notes;
    date;
    position;
    exercises;
}
exports.SessionDto = SessionDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Session title', example: 'Workout A' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SessionDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Session notes', example: 'Push day' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SessionDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Planned date' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Date)
], SessionDto.prototype, "date", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Position in week', example: 0 }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], SessionDto.prototype, "position", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [SessionExerciseDto], description: 'Exercises in session' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => SessionExerciseDto),
    __metadata("design:type", Array)
], SessionDto.prototype, "exercises", void 0);
class WeekDto {
    weekNumber;
    position;
    sessions;
}
exports.WeekDto = WeekDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Week number', example: 1 }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], WeekDto.prototype, "weekNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Position in block', example: 0 }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], WeekDto.prototype, "position", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [SessionDto], description: 'Sessions in week' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => SessionDto),
    __metadata("design:type", Array)
], WeekDto.prototype, "sessions", void 0);
class BlockDto {
    title;
    notes;
    position;
    weeks;
}
exports.BlockDto = BlockDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Block title', example: 'Strength Block' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BlockDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Block notes', example: 'Focus on compound lifts' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BlockDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Position in program', example: 0 }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], BlockDto.prototype, "position", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [WeekDto], description: 'Weeks in block' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => WeekDto),
    __metadata("design:type", Array)
], BlockDto.prototype, "weeks", void 0);
class CreateProgramDto {
    title;
    description;
    isDraft = true;
    blocks;
}
exports.CreateProgramDto = CreateProgramDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Program title', example: '12-Week Strength Program' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateProgramDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Program description' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateProgramDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Is draft (not published)', example: true }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateProgramDto.prototype, "isDraft", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [BlockDto], description: 'Nested program structure' }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => BlockDto),
    __metadata("design:type", Array)
], CreateProgramDto.prototype, "blocks", void 0);
class UpdateProgramDto {
    title;
    description;
    isDraft;
}
exports.UpdateProgramDto = UpdateProgramDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Program title' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateProgramDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Program description' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateProgramDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Is draft' }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateProgramDto.prototype, "isDraft", void 0);
class ProgramResponseDto {
    id;
    title;
    description;
    coachId;
    isDraft;
    createdAt;
    updatedAt;
}
exports.ProgramResponseDto = ProgramResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ProgramResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ProgramResponseDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], ProgramResponseDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ProgramResponseDto.prototype, "coachId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], ProgramResponseDto.prototype, "isDraft", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], ProgramResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], ProgramResponseDto.prototype, "updatedAt", void 0);
//# sourceMappingURL=program.dto.js.map