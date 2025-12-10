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
exports.ExportModule = void 0;
const common_1 = require("@nestjs/common");
const pdfkit_export_service_1 = require("./pdfkit-export.service");
const export_controller_1 = require("./export.controller");
const program_module_1 = require("../programs/program.module");
let ExportModule = class ExportModule {
    constructor() {
        console.log('✅ Export Module initialized (pdfkit-based)');
    }
};
exports.ExportModule = ExportModule;
exports.ExportModule = ExportModule = __decorate([
    (0, common_1.Module)({
        imports: [program_module_1.ProgramModule],
        providers: [pdfkit_export_service_1.PdtkitExportService],
        controllers: [export_controller_1.ExportController],
        exports: [pdfkit_export_service_1.PdtkitExportService],
    }),
    __metadata("design:paramtypes", [])
], ExportModule);
//# sourceMappingURL=pdfkit-export.module.js.map