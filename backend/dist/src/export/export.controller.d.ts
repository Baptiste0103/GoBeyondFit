import type { Response as ExpressResponse } from 'express';
import { PdtkitExportService } from './pdfkit-export.service';
import { PrismaService } from '../prisma/prisma.service';
export declare class ExportController {
    private readonly pdfExportService;
    private readonly prisma;
    private readonly logger;
    constructor(pdfExportService: PdtkitExportService, prisma: PrismaService);
    exportProgramAsPDF(programId: string, theme?: string, res?: ExpressResponse): Promise<void>;
    getAvailableFormats(): {
        formats: string[];
        themes: string[];
        sizes: string[];
        description: string;
    };
    getHealthStatus(): {
        status: string;
        service: string;
        memory: {
            heapUsed: string;
            heapTotal: string;
        };
        timestamp: string;
    };
    private transformProgramForPDF;
}
