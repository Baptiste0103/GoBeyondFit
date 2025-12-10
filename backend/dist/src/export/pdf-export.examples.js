"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.example1_generatePDF = example1_generatePDF;
exports.example2_nestjsController = example2_nestjsController;
exports.example3_frontendIntegration = example3_frontendIntegration;
exports.example4_apiClientUsage = example4_apiClientUsage;
exports.example5_errorHandling = example5_errorHandling;
exports.example6_performanceOptimization = example6_performanceOptimization;
exports.runAllExamples = runAllExamples;
const pdf_export_service_1 = require("./pdf-export.service");
async function example1_generatePDF() {
    const service = new pdf_export_service_1.PdfExportService();
    try {
        await service.initializeBrowser();
        const mockProgram = {
            id: 'prog-123',
            title: 'Programme de Force 12 Semaines',
            description: 'Un programme complet de développement de force avec progressions linéaires',
            blocks: [
                {
                    id: 'block-1',
                    title: 'Fondation',
                    weeks: [
                        {
                            id: 'week-1',
                            weekNumber: 1,
                            sessions: [
                                {
                                    id: 'session-1',
                                    title: 'Upper Body A',
                                    exercises: [
                                        {
                                            id: 'ex-1',
                                            name: 'Développé Couché',
                                            description: 'Barbell Bench Press',
                                            config: {
                                                sets: 4,
                                                reps: 6,
                                                weight: 80,
                                                rest: '3-4 min',
                                                format: 'DS',
                                                film: true,
                                            },
                                        },
                                        {
                                            id: 'ex-2',
                                            name: 'Tirage Horizontal',
                                            description: 'Barbell Rows',
                                            config: {
                                                sets: 4,
                                                reps: 6,
                                                weight: 85,
                                                rest: '3-4 min',
                                                format: 'DS',
                                            },
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            ],
        };
        const pdfBuffer = await service.generateProgramPDF(mockProgram);
        console.log(`✅ PDF generated: ${pdfBuffer.length} bytes`);
        const filePath = await service.exportPDFToFile(pdfBuffer, 'example_program.pdf');
        console.log(`✅ PDF saved to: ${filePath}`);
        await service.closeBrowser();
    }
    catch (error) {
        console.error('❌ Error:', error);
    }
}
async function example2_nestjsController() {
    const exampleControllerCode = `
import { Controller, Post, Param, Res, UseGuards } from '@nestjs/common'
import { Response } from 'express'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { PdfExportService } from './pdf-export.service'
import { PrismaService } from '../prisma/prisma.service'

@Controller('export')
@UseGuards(JwtAuthGuard)
export class ExportController {
  constructor(
    private readonly pdfService: PdfExportService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('programs/:programId/pdf')
  async exportProgramAsPDF(
    @Param('programId') programId: string,
    @Res() res: Response,
  ): Promise<void> {
    // Fetch program
    const program = await this.prisma.program.findUnique({
      where: { id: programId },
      include: { blocks: { include: { weeks: { include: { sessions: { include: { exercises: { include: { exercise: true } } } } } } } } }
    })

    // Generate PDF
    const pdfBuffer = await this.pdfService.generateProgramPDF(program)

    // Return as download
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': \`attachment; filename="\${program.title}.pdf"\`,
    })
    res.send(pdfBuffer)
  }
}
  `;
    console.log('Example Controller Implementation:');
    console.log(exampleControllerCode);
}
function example3_frontendIntegration() {
    const exampleComponentCode = `
import { PDFExportButton } from '@/components/pdf-export-button'

export default function ProgramPage({ program }) {
  return (
    <div>
      <h1>{program.title}</h1>
      
      {/* Use the button component */}
      <PDFExportButton
        programId={program.id}
        programTitle={program.title}
        variant="primary"
        fullWidth={false}
      />

      {/* Rest of program content */}
    </div>
  )
}
  `;
    console.log('Example Frontend Component:');
    console.log(exampleComponentCode);
}
async function example4_apiClientUsage() {
    const exampleClientCode = `
import { downloadProgramPDF } from '@/lib/pdf-api-client'

// Simple usage
async function downloadProgram() {
  try {
    await downloadProgramPDF('program-id', 'My Program Title')
    // PDF downloaded!
  } catch (error) {
    console.error('Download failed:', error)
  }
}

// With error handling and UI feedback
async function downloadWithFeedback() {
  try {
    await downloadProgramPDF('program-id', 'Program')
    showSuccessMessage('PDF downloaded successfully!')
  } catch (error) {
    showErrorMessage(\`Failed: \${error.message}\`)
  }
}
  `;
    console.log('Example API Client Usage:');
    console.log(exampleClientCode);
}
async function example5_errorHandling() {
    const service = new pdf_export_service_1.PdfExportService();
    const errorHandlingCode = `
// Check if PDF service is available
import { checkPDFServiceHealth } from '@/lib/pdf-api-client'

async function ensurePDFAvailable() {
  const isHealthy = await checkPDFServiceHealth()
  
  if (!isHealthy) {
    console.warn('PDF service temporarily unavailable')
    // Show alternative export formats or disable button
    return false
  }
  
  return true
}

// Handle different error types
async function robustDownload(programId: string) {
  try {
    await downloadProgramPDF(programId, 'Program')
  } catch (error) {
    if (error instanceof NetworkError) {
      console.error('Network connection issue')
    } else if (error instanceof AuthenticationError) {
      console.error('Please login again')
    } else if (error instanceof NotFoundError) {
      console.error('Program not found')
    } else {
      console.error('Unknown error:', error)
    }
  }
}
  `;
    console.log('Example Error Handling:');
    console.log(errorHandlingCode);
}
function example6_performanceOptimization() {
    const optimizationCode = `
// Service initialization strategy:
// 1. Browser initializes on module startup (ExportModule.onModuleInit)
// 2. Browser is reused for all PDF requests
// 3. Pages are closed after each PDF generation
// 4. Browser closes on app shutdown (ExportModule.onModuleDestroy)

// This means:
// - First request: 2-3 seconds (browser startup)
// - Subsequent requests: 0.5-1 second (page creation + rendering)

// For high concurrency, Puppeteer creates new pages in parallel
// but uses the same browser instance, keeping memory efficient.

// To handle high load:
// 1. Implement request queuing
// 2. Add rate limiting
// 3. Cache frequently requested PDFs
// 4. Monitor browser memory usage

// Example cache implementation:
const pdfCache = new Map<string, Buffer>()

async function getCachedPDF(programId: string): Promise<Buffer> {
  if (pdfCache.has(programId)) {
    return pdfCache.get(programId)!
  }

  const pdf = await generateProgramPDF(programId)
  pdfCache.set(programId, pdf)

  // Clear cache entry after 1 hour
  setTimeout(() => pdfCache.delete(programId), 60 * 60 * 1000)

  return pdf
}
  `;
    console.log('Example Performance Optimization:');
    console.log(optimizationCode);
}
async function runAllExamples() {
    console.log('\n🎯 PDF Export Service - Examples\n');
    console.log('================================\n');
    console.log('Example 1: Generate PDF');
    console.log('------------------------');
    console.log('\n\nExample 2: NestJS Controller');
    console.log('-----------------------------');
    await example2_nestjsController();
    console.log('\n\nExample 3: Frontend Integration');
    console.log('-------------------------------');
    example3_frontendIntegration();
    console.log('\n\nExample 4: API Client Usage');
    console.log('---------------------------');
    example4_apiClientUsage();
    console.log('\n\nExample 5: Error Handling');
    console.log('-----------------------');
    await example5_errorHandling();
    console.log('\n\nExample 6: Performance Optimization');
    console.log('----------------------------------');
    example6_performanceOptimization();
    console.log('\n\n✅ Examples complete!\n');
}
//# sourceMappingURL=pdf-export.examples.js.map