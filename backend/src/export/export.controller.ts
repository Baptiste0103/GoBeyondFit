import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  Res,
  HttpStatus,
  Logger,
} from '@nestjs/common'
import type { Response as ExpressResponse } from 'express'
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { PdtkitExportService } from './pdfkit-export.service'
import { PrismaService } from '../prisma/prisma.service'

@ApiTags('Export')
@ApiBearerAuth()
@Controller('export')
@UseGuards(JwtAuthGuard)
export class ExportController {
  private readonly logger = new Logger(ExportController.name)

  constructor(
    private readonly pdfExportService: PdtkitExportService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Export program as PDF
   * GET /api/export/programs/:programId/pdf?theme=default
   */
  @Get('programs/:programId/pdf')
  @ApiOperation({ summary: 'Export program as PDF' })
  @ApiResponse({
    status: 200,
    description: 'PDF file generated and returned',
    content: { 'application/pdf': {} },
  })
  async exportProgramAsPDF(
    @Param('programId') programId: string,
    @Query('theme') theme?: string,
    @Res() res?: ExpressResponse,
  ) {
    const startTime = Date.now()

    try {
      this.logger.log(`[PDF Export] Starting for program: ${programId}`)

      // Fetch program with all nested data
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
                        include: {
                          exercise: {
                            select: {
                              id: true,
                              name: true,
                              description: true,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      })

      if (!program) {
        this.logger.warn(`Program not found: ${programId}`)
        res!.status(HttpStatus.NOT_FOUND).json({
          error: 'Program not found',
        })
        return
      }

      // Transform data for PDF
      const programForPDF = this.transformProgramForPDF(program as any)

      // Generate PDF
      this.logger.log('[PDF Export] Generating PDF...')
      const themeOptions = this.pdfExportService.getThemeOptions()
      const selectedTheme =
        theme && themeOptions[theme] ? themeOptions[theme] : undefined

      const pdfBuffer = await this.pdfExportService.generateProgramPDF(
        programForPDF,
        selectedTheme,
      )

      // Set response headers
      const filename = `${program.title
        .replace(/[^a-z0-9]/gi, '-')
        .toLowerCase()}.pdf`
      res!.setHeader('Content-Type', 'application/pdf')
      res!.setHeader(
        'Content-Disposition',
        `attachment; filename="${filename}"`,
      )
      res!.setHeader('Content-Length', pdfBuffer.length)
      res!.setHeader('Cache-Control', 'public, max-age=3600')

      // Send PDF
      res!.status(HttpStatus.OK).send(pdfBuffer)

      const duration = Date.now() - startTime
      this.logger.log(
        `[PDF Export] SUCCESS - ${programId} in ${duration}ms (${(pdfBuffer.length / 1024).toFixed(2)} KB)`,
      )
    } catch (error) {
      const duration = Date.now() - startTime
      this.logger.error(
        `[PDF Export] ERROR - ${programId} after ${duration}ms: ${(error as Error).message}`,
      )

      res!.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to generate PDF',
        message: (error as Error).message,
      })
    }
  }

  /**
   * Get available export formats and themes
   */
  @Get('formats')
  @ApiOperation({ summary: 'Get available export formats' })
  getAvailableFormats() {
    return {
      formats: ['pdf'],
      themes: Object.keys(this.pdfExportService.getThemeOptions()),
      sizes: ['A4'],
      description: 'Export training programs in multiple formats',
    }
  }

  /**
   * Health check for export service
   */
  @Get('health')
  @ApiOperation({ summary: 'Health check for export service' })
  getHealthStatus() {
    return {
      status: 'healthy',
      service: 'pdfkit-export',
      memory: {
        heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`,
        heapTotal: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)} MB`,
      },
      timestamp: new Date().toISOString(),
    }
  }

  /**
   * Transform Prisma program structure to PDF structure
   */
  private transformProgramForPDF(program: any) {
    return {
      id: program.id,
      title: program.title,
      description: program.description,
      blocks: program.blocks.map((block: any) => ({
        id: block.id,
        title: block.title,
        weeks: block.weeks.map((week: any) => ({
          id: week.id,
          weekNumber: week.weekNumber,
          sessions: week.sessions.map((session: any) => ({
            id: session.id,
            title: session.title,
            exercises: session.exercises.map((se: any) => ({
              id: se.id,
              name: se.exercise?.name || 'Unknown',
              description: se.exercise?.description,
              config: se.config,
            })),
          })),
        })),
      })),
    }
  }
}
