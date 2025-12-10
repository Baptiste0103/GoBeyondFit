interface ProgramForPDF {
    id: string;
    title: string;
    description?: string;
    blocks: Array<{
        id: string;
        title?: string;
        weeks: Array<{
            id: string;
            weekNumber: number;
            sessions: Array<{
                id: string;
                title?: string;
                exercises: Array<{
                    id: string;
                    name: string;
                    description?: string;
                    config?: {
                        sets?: number;
                        reps?: number | string;
                        weight?: number;
                        duration?: number;
                        format?: string;
                        rest?: string;
                        notes?: string;
                        film?: boolean;
                        rpe?: number;
                    };
                }>;
            }>;
        }>;
    }>;
}
export declare class PdfExportService {
    private readonly logger;
    private browser;
    initializeBrowser(): Promise<void>;
    closeBrowser(): Promise<void>;
    private generateHTMLContent;
    generateProgramPDF(program: ProgramForPDF): Promise<Buffer>;
    exportPDFToFile(pdfBuffer: Buffer, filename: string): Promise<string>;
}
export {};
