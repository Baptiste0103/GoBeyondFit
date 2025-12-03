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
exports.SessionProgressResponseDto = exports.CreateSessionProgressDto = exports.AddExerciseToSessionDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class AddExerciseToSessionDto {
    exerciseId;
    config;
}
exports.AddExerciseToSessionDto = AddExerciseToSessionDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Exercise ID to add',
        example: 'uuid-here',
    }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AddExerciseToSessionDto.prototype, "exerciseId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Exercise configuration',
        example: {
            sets: 3,
            reps: 10,
            format: 'standard',
            weight: 20,
            duration: 60,
            notes: 'Optional notes',
        },
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], AddExerciseToSessionDto.prototype, "config", void 0);
class CreateSessionProgressDto {
    exerciseInstanceId;
    progress;
    notes;
    videos;
}
exports.CreateSessionProgressDto = CreateSessionProgressDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Exercise instance ID',
        example: 'uuid-here',
    }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateSessionProgressDto.prototype, "exerciseInstanceId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Progress data (sets, reps, weights, notes, etc)',
        example: { sets: [{ reps: 10, weight: 100 }], done: false },
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateSessionProgressDto.prototype, "progress", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Workout notes',
        example: 'Felt strong today',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSessionProgressDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Video upload URLs',
        example: ['https://...'],
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateSessionProgressDto.prototype, "videos", void 0);
class SessionProgressResponseDto {
    id;
    sessionId;
    studentId;
    exerciseInstanceId;
    progress;
    notes;
    videos;
    savedAt;
}
exports.SessionProgressResponseDto = SessionProgressResponseDto;
//# sourceMappingURL=session.dto.js.map