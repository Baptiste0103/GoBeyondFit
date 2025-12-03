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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProgramTemplatesController = exports.ProgramBuilderController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const program_builder_service_1 = require("./program-builder.service");
let ProgramBuilderController = class ProgramBuilderController {
    builderService;
    constructor(builderService) {
        this.builderService = builderService;
    }
    async filterExercises(page = 1, limit = 20, muscleGroups, difficulty, search, exclude) {
        if (limit > 100)
            limit = 100;
        if (page < 1)
            page = 1;
        const options = {
            muscleGroups: muscleGroups ? muscleGroups.split(',') : undefined,
            difficulty,
            searchQuery: search,
            excludeExercises: exclude ? exclude.split(',') : undefined,
        };
        return this.builderService.filterExercises(options, page, limit);
    }
    async validateProgram(programData) {
        return this.builderService.validateProgram(programData);
    }
    async checkDuplicates({ exercises }) {
        if (!exercises || !Array.isArray(exercises)) {
            throw new common_1.BadRequestException('Exercises array is required');
        }
        const result = this.builderService.checkDuplicates(exercises);
        if (result.hasDuplicates && result.duplicates.length > 0) {
            const exerciseIds = result.duplicates.map((d) => d.exerciseId);
            const exerciseMap = await this.builderService.getExercisesWithDetails(exerciseIds);
            result.duplicates.forEach((dup) => {
                const exercise = exerciseMap.get(dup.exerciseId);
                if (exercise) {
                    dup.exerciseName = exercise.name;
                }
            });
        }
        return result;
    }
    async cloneProgram(programId, { title }, req) {
        if (!title || title.length < 3) {
            throw new common_1.BadRequestException('Title must be at least 3 characters');
        }
        return this.builderService.cloneProgram(req.user.id, programId, title);
    }
    async getProgramStats(programId) {
        return this.builderService.getProgramStats(programId);
    }
    async getProgramDetails(programId, req) {
        return this.builderService.getProgramDetails(programId, req.user.id);
    }
    async saveProgram(programId, saveData, req) {
        return this.builderService.saveProgram(req.user.id, programId, saveData);
    }
};
exports.ProgramBuilderController = ProgramBuilderController;
__decorate([
    (0, common_1.Get)('exercises/filter'),
    __param(0, (0, common_1.Query)('page', new common_1.DefaultValuePipe(1), common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(20), common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('muscleGroups')),
    __param(3, (0, common_1.Query)('difficulty')),
    __param(4, (0, common_1.Query)('search')),
    __param(5, (0, common_1.Query)('exclude')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String, String, String, String]),
    __metadata("design:returntype", Promise)
], ProgramBuilderController.prototype, "filterExercises", null);
__decorate([
    (0, common_1.Post)('validate'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProgramBuilderController.prototype, "validateProgram", null);
__decorate([
    (0, common_1.Post)('check-duplicates'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProgramBuilderController.prototype, "checkDuplicates", null);
__decorate([
    (0, common_1.Post)(':programId/clone'),
    (0, common_1.HttpCode)(201),
    __param(0, (0, common_1.Param)('programId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], ProgramBuilderController.prototype, "cloneProgram", null);
__decorate([
    (0, common_1.Get)(':programId/stats'),
    __param(0, (0, common_1.Param)('programId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProgramBuilderController.prototype, "getProgramStats", null);
__decorate([
    (0, common_1.Get)(':programId/details'),
    __param(0, (0, common_1.Param)('programId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ProgramBuilderController.prototype, "getProgramDetails", null);
__decorate([
    (0, common_1.Put)(':programId/save'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Param)('programId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], ProgramBuilderController.prototype, "saveProgram", null);
exports.ProgramBuilderController = ProgramBuilderController = __decorate([
    (0, common_1.Controller)('programs/builder'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [program_builder_service_1.ProgramBuilderService])
], ProgramBuilderController);
let ProgramTemplatesController = class ProgramTemplatesController {
    builderService;
    constructor(builderService) {
        this.builderService = builderService;
    }
    async createFromTemplate(templateId, { title, customizations }, req) {
        if (!title || title.length < 3) {
            throw new common_1.BadRequestException('Title must be at least 3 characters');
        }
        const templates = {
            'beginner-strength': {
                blocks: [
                    {
                        title: 'Foundation Phase',
                        weeks: [
                            {
                                weekNumber: 1,
                                sessions: [
                                    { title: 'Full Body A', exercises: [] },
                                    { title: 'Full Body B', exercises: [] },
                                    { title: 'Full Body C', exercises: [] },
                                ],
                            },
                        ],
                    },
                ],
            },
        };
        const template = templates[templateId];
        if (!template) {
            throw new common_1.BadRequestException('Template not found');
        }
        return {
            message: `Program created from template: ${templateId}`,
            title,
            template: templateId,
        };
    }
};
exports.ProgramTemplatesController = ProgramTemplatesController;
__decorate([
    (0, common_1.Post)(':templateId/create'),
    (0, common_1.HttpCode)(201),
    __param(0, (0, common_1.Param)('templateId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], ProgramTemplatesController.prototype, "createFromTemplate", null);
exports.ProgramTemplatesController = ProgramTemplatesController = __decorate([
    (0, common_1.Controller)('programs/builder/templates'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [program_builder_service_1.ProgramBuilderService])
], ProgramTemplatesController);
//# sourceMappingURL=program-builder.controller.js.map