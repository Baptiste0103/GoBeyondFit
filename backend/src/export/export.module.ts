import { Module } from '@nestjs/common'
import { ExportController } from './export.controller'
import { PdtkitExportService } from './pdfkit-export.service'
import { PrismaService } from '../prisma/prisma.service'
import { ProgramModule } from '../programs/program.module'

/**
 * Export Module - PDF Generation
 * Uses pdfkit for lightweight, fast PDF generation
 *
 * Features:
 * - Generate PDFs from training programs
 * - Multiple theme options (default, dark, minimal)
 * - In-memory PDF generation (no temp files)
 * - Lightweight (~10MB RAM per request)
 * - Fast generation (100-500ms)
 */
@Module({
  imports: [ProgramModule],
  controllers: [ExportController],
  providers: [PdtkitExportService, PrismaService],
  exports: [PdtkitExportService],
})
export class ExportModule {
  constructor() {
    console.log('✅ Export Module initialized (pdfkit-based)')
  }
}
