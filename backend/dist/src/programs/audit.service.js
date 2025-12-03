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
exports.AuditService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AuditService = class AuditService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async logChange(programId, changedBy, changeType, diff) {
        try {
            await this.prisma.programAudit.create({
                data: {
                    programId,
                    changedBy,
                    changeType,
                    diff: diff || {},
                },
            });
        }
        catch (error) {
            console.error(`[AuditService] Failed to log change: ${error}`);
        }
    }
    async getAuditLog(programId) {
        return this.prisma.programAudit.findMany({
            where: { programId },
            include: { user: { select: { id: true, pseudo: true, email: true } } },
            orderBy: { createdAt: 'desc' },
        });
    }
    calculateDiff(oldData, newData) {
        const diff = {};
        for (const key in newData) {
            if (oldData[key] !== newData[key]) {
                diff[key] = {
                    before: oldData[key],
                    after: newData[key],
                };
            }
        }
        for (const key in oldData) {
            if (!(key in newData)) {
                diff[key] = {
                    before: oldData[key],
                    after: null,
                };
            }
        }
        return diff;
    }
};
exports.AuditService = AuditService;
exports.AuditService = AuditService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuditService);
//# sourceMappingURL=audit.service.js.map