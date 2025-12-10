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
var ExportController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExportController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const program_service_1 = require("../programs/program.service");
const pdfkit_export_service_1 = require("./pdfkit-export.service");
const prisma_service_1 = require("../prisma/prisma.service");
let ExportController = ExportController_1 = class ExportController {
    programService;
    pdfExportService;
    prisma;
    logger = new common_1.Logger(ExportController_1.name);
    constructor(programService, pdfExportService, prisma) {
        this.programService = programService;
        this.pdfExportService = pdfExportService;
        this.prisma = prisma;
    }
    async exportProgramPDF(programId, theme, res) {
        const startTime = Date.now();
        try {
            this.logger.log(`[PDF Export] Starting for program: ${programId}`);
            this.logger.log('[PDF Export] Fetching program data...');
            const program = await this.prisma.program.findUnique({
                where: { id: programId },
                include: {
                    blocks: {
                        include: {
                            weeks: {
                                include: {
                                    sessions: {
                                        include: {
                                            exercises: {
                                                include: { exercise: true },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            });
            if (!program) {
                res.status(common_1.HttpStatus.NOT_FOUND).json({
                    error: 'Program not found',
                });
                return;
            }
            const programForPDF = this.transformProgramForPDF(program);
            this.logger.log('[PDF Export] Generating PDF...');
            const themeOptions = this.pdfExportService.getThemeOptions();
            const selectedTheme = theme && themeOptions[theme] ? themeOptions[theme] : undefined;
            const pdfBuffer = await this.pdfExportService.generateProgramPDF(programForPDF, selectedTheme);
            const filename = `${program.title
                .replace(/[^a-z0-9]/gi, '-')
                .toLowerCase()}.pdf`;
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.setHeader('Content-Length', pdfBuffer.length);
            res.setHeader('Cache-Control', 'public, max-age=3600');
            res.status(common_1.HttpStatus.OK).send(pdfBuffer);
            const duration = Date.now() - startTime;
            this.logger.log(`[PDF Export] SUCCESS - ${programId} in ${duration}ms (${(pdfBuffer.length / 1024).toFixed(2)} KB)`);
        }
        catch (error) {
            const duration = Date.now() - startTime;
            this.logger.error(`[PDF Export] ERROR - ${programId} after ${duration}ms: ${error.message}`);
            res.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).json({
                error: 'Failed to generate PDF',
                message: error.message,
            });
        }
    }
    getAvailableFormats() {
        return {
            formats: ['pdf'],
            themes: Object.keys(this.pdfExportService.getThemeOptions()),
            sizes: ['A4'],
            description: 'Export training programs in multiple formats',
        };
    }
    getHealthStatus() {
        return {
            status: 'healthy',
            service: 'pdfkit-export',
            memory: {
                heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`,
                heapTotal: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)} MB`,
            },
            timestamp: new Date().toISOString(),
        };
    }
    transformProgramForPDF(program) {
        return {
            id: program.id,
            title: program.title,
            description: program.description,
            blocks: program.blocks.map((block) => ({
                id: block.id,
                title: block.title,
                weeks: block.weeks.map((week) => ({
                    id: week.id,
                    weekNumber: week.weekNumber,
                    sessions: week.sessions.map((session) => ({
                        id: session.id,
                        title: session.title,
                        exercises: session.exercises.map((se) => ({
                            id: se.id,
                            name: se.exercise?.name || 'Unknown',
                            description: se.exercise?.description,
                            config: se.config,
                        })),
                    })),
                })),
            })),
        };
    }
};
exports.ExportController = ExportController;
__decorate([
    (0, common_1.Get)('programs/:programId/pdf'),
    __param(0, (0, common_1.Param)('programId')),
    __param(1, (0, common_1.Query)('theme')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ExportController.prototype, "exportProgramPDF", null);
__decorate([
    (0, common_1.Get)('formats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ExportController.prototype, "getAvailableFormats", null);
__decorate([
    (0, common_1.Get)('health'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ExportController.prototype, "getHealthStatus", null);
exports.ExportController = ExportController = ExportController_1 = __decorate([
    (0, common_1.Controller)('export'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [program_service_1.ProgramService,
        pdfkit_export_service_1.PdtkitExportService,
        prisma_service_1.PrismaService])
], ExportController);
//# sourceMappingURL=pdfkit-export.controller.js.map