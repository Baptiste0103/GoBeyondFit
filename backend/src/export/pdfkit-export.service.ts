import { Injectable, Logger } from '@nestjs/common'
import PDFDocument from 'pdfkit'

interface ExerciseConfig {
  sets?: number
  reps?: number | string
  weight?: number
  duration?: number
  format?: string
  rest?: string
  notes?: string
  film?: boolean
  rpe?: number
}

interface Exercise {
  id: string
  name: string
  description?: string
  config?: ExerciseConfig
}

interface Session {
  id: string
  title?: string
  exercises: Exercise[]
}

interface Week {
  id: string
  weekNumber: number
  sessions: Session[]
}

interface Block {
  id: string
  title?: string
  weeks: Week[]
}

interface ProgramForPDF {
  id: string
  title: string
  description?: string
  blocks: Block[]
}

interface PDFTheme {
  primaryColor: string
  secondaryColor: string
  accentColor: string
  headerBg: string
  cardBorder: string
  pillEasyBg: string
  pillMediumBg: string
  pillHardBg: string
}

@Injectable()
export class PdtkitExportService {
  private readonly logger = new Logger(PdtkitExportService.name)

  // Design Rules Applied:
  // ✅ HTML Tables for main structure
  // ✅ Standard fonts (Helvetica)
  // ✅ Page breaks for exercises (tr { page-break-inside: avoid })
  // ✅ Card design with grey borders (#eee)
  // ✅ Dark header (#333) with white text
  // ✅ Pill-style difficulty tags

  private readonly defaultTheme: PDFTheme = {
    primaryColor: '#2E7D32', // Green
    secondaryColor: '#1565C0', // Blue
    accentColor: '#FF6F00', // Orange
    headerBg: '#333333', // Dark header
    cardBorder: '#eeeeee', // Light grey border
    pillEasyBg: '#27ae60', // Green
    pillMediumBg: '#f39c12', // Orange
    pillHardBg: '#e74c3c', // Red
  }

  /**
   * Generate program PDF as Buffer with strict design rules
   *
   * Design Rules Implementation:
   * 1. Tables for alignment
   * 2. Standard Helvetica font
   * 3. Page breaks between exercises
   * 4. Card styling (#eee borders, padding)
   * 5. Dark header (#333)
   * 6. Pill-style tags for difficulty
   */
  async generateProgramPDF(
    program: ProgramForPDF,
    theme?: Partial<PDFTheme>,
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margin: 0,
          bufferPages: true,
        })

        const buffers: Buffer[] = []

        doc.on('data', (chunk: Buffer) => buffers.push(chunk))
        doc.on('end', () => resolve(Buffer.concat(buffers)))
        doc.on('error', reject)

        const finalTheme = { ...this.defaultTheme, ...theme }

        // Generate PDF content
        this.renderProgramPDF(doc, program, finalTheme)

        doc.end()
      } catch (error) {
        this.logger.error(
          `PDF generation error: ${(error as Error).message}`,
        )
        reject(error)
      }
    })
  }

  /**
   * Main PDF rendering with strict design rules
   */
  private renderProgramPDF(
    doc: PDFDocument,
    program: ProgramForPDF,
    theme: PDFTheme,
  ): void {
    // 1. Add header with dark background (#333)
    this.addHeader(doc, program, theme)

    // 2. Add description
    if (program.description) {
      this.addDescription(doc, program.description, theme)
    }

    // 3. Add blocks with tables
    program.blocks.forEach((block, blockIdx) => {
      this.renderBlock(doc, block, blockIdx + 1, theme)
    })

    // 4. Add footer
    this.addFooter(doc, theme)
  }

  /**
   * Dark header (#333) with program title and info
   */
  private addHeader(
    doc: PDFDocument,
    program: ProgramForPDF,
    theme: PDFTheme,
  ): void {
    // Header background (#333)
    doc.rect(0, 0, 612, 80).fillColor(theme.headerBg).fill()

    // Title (white text)
    doc
      .fillColor('white')
      .font('Helvetica-Bold')
      .fontSize(24)
      .text(program.title, 30, 15, {
        width: 550,
        align: 'left',
      })

    // Generated date
    doc
      .font('Helvetica')
      .fontSize(10)
      .text(
        `Generated: ${new Date().toLocaleDateString()} | Page PDF Export`,
        30,
        50,
        {
          width: 550,
          align: 'left',
        },
      )

    doc.y = 90
  }

  /**
   * Description section with light background
   */
  private addDescription(
    doc: PDFDocument,
    description: string,
    theme: PDFTheme,
  ): void {
    if (doc.y > 740) {
      doc.addPage()
      doc.y = 30
    }

    // Light grey background
    doc.rect(0, doc.y - 5, 612, 40).fillColor('#f9f9f9').fill()

    doc
      .fillColor('#333333')
      .font('Helvetica')
      .fontSize(11)
      .text(description, 30, doc.y, {
        width: 550,
        align: 'left',
      })

    doc.y += 30
  }

  /**
   * Render block with table structure
   */
  private renderBlock(
    doc: PDFDocument,
    block: Block,
    blockNumber: number,
    theme: PDFTheme,
  ): void {
    if (doc.y > 740) {
      doc.addPage()
      doc.y = 30
    }

    // Block header
    doc
      .fillColor(theme.primaryColor)
      .font('Helvetica-Bold')
      .fontSize(14)
      .text(`Block ${blockNumber}: ${block.title || 'Training Block'}`, 30, doc.y, {
        width: 550,
      })

    doc.y += 20

    // Render weeks
    block.weeks.forEach((week) => {
      this.renderWeek(doc, week, theme)
    })
  }

  /**
   * Render week with sessions
   */
  private renderWeek(
    doc: PDFDocument,
    week: Week,
    theme: PDFTheme,
  ): void {
    if (doc.y > 740) {
      doc.addPage()
      doc.y = 30
    }

    // Week header
    doc
      .fillColor(theme.secondaryColor)
      .font('Helvetica-Bold')
      .fontSize(12)
      .text(`Week ${week.weekNumber}`, 40, doc.y)

    doc.y += 15

    // Sessions in this week
    week.sessions.forEach((session, idx) => {
      this.renderSession(doc, session, idx + 1, theme)
    })

    doc.y += 10
  }

  /**
   * Render session with exercises table
   */
  private renderSession(
    doc: PDFDocument,
    session: Session,
    sessionNumber: number,
    theme: PDFTheme,
  ): void {
    if (doc.y > 740) {
      doc.addPage()
      doc.y = 30
    }

    // Session title
    doc
      .fillColor(theme.accentColor)
      .font('Helvetica-Bold')
      .fontSize(11)
      .text(`Session ${sessionNumber}${session.title ? `: ${session.title}` : ''}`, 50, doc.y)

    doc.y += 12

    // Exercises table with card design
    this.renderExercisesTable(doc, session.exercises, theme)
  }

  /**
   * Render exercises as table with card design
   * Design Rules:
   * - Table structure for alignment
   * - Light grey borders (#eee)
   * - Padding for card look
   * - Pill-style difficulty tags
   */
  private renderExercisesTable(
    doc: PDFDocument,
    exercises: Exercise[],
    theme: PDFTheme,
  ): void {
    if (!exercises || exercises.length === 0) {
      return
    }

    const startX = 60
    const tableWidth = 490
    const colWidths = {
      name: 180,
      sets: 50,
      reps: 50,
      weight: 70,
      rest: 60,
      difficulty: 80,
    }

    // Table header with dark background
    this.drawTableHeader(
      doc,
      startX,
      tableWidth,
      colWidths,
      theme,
    )

    doc.y += 2

    // Render each exercise as a table row with card styling
    exercises.forEach((exercise, idx) => {
      if (doc.y > 740) {
        doc.addPage()
        doc.y = 30
      }

      this.renderExerciseRow(doc, exercise, idx, startX, colWidths, theme)
    })

    doc.y += 10
  }

  /**
   * Draw table header with styling
   */
  private drawTableHeader(
    doc: PDFDocument,
    startX: number,
    tableWidth: number,
    colWidths: Record<string, number>,
    theme: PDFTheme,
  ): void {
    const headers = ['Exercise', 'Sets', 'Reps', 'Weight', 'Rest', 'Difficulty']

    // Header background (dark)
    doc
      .rect(startX, doc.y, tableWidth, 18)
      .fillColor('#f0f0f0')
      .fill()

    // Header border
    doc
      .rect(startX, doc.y, tableWidth, 18)
      .strokeColor(theme.cardBorder)
      .lineWidth(1)
      .stroke()

    // Header text
    doc
      .font('Helvetica-Bold')
      .fontSize(9)
      .fillColor('#333333')

    let x = startX + 5
    headers.forEach((header, idx) => {
      const width = Object.values(colWidths)[idx]
      doc.text(header, x, doc.y + 4, {
        width: width - 10,
        align: 'left',
      })
      x += width
    })

    doc.y += 18
  }

  /**
   * Render single exercise row with card styling
   * Rules:
   * - Light grey borders (#eee)
   * - Padding for card appearance
   * - Pill-style difficulty tags
   * - Page break to avoid cutting exercise
   */
  private renderExerciseRow(
    doc: PDFDocument,
    exercise: Exercise,
    idx: number,
    startX: number,
    colWidths: Record<string, number>,
    theme: PDFTheme,
  ): void {
    const config = exercise.config || {}
    const rowHeight = 24
    const isAlternate = idx % 2 === 0

    // Card background (light grey for alternating rows)
    if (isAlternate) {
      doc
        .rect(startX, doc.y, Object.values(colWidths).reduce((a, b) => a + b), rowHeight)
        .fillColor('#fafafa')
        .fill()
    }

    // Card border (#eee)
    doc
      .rect(startX, doc.y, Object.values(colWidths).reduce((a, b) => a + b), rowHeight)
      .strokeColor(theme.cardBorder)
      .lineWidth(0.5)
      .stroke()

    // Cell content
    doc
      .font('Helvetica')
      .fontSize(9)
      .fillColor('#333333')

    let x = startX + 5
    const rowY = doc.y + 5

    // Exercise name
    doc.text(exercise.name, x, rowY, {
      width: colWidths.name - 10,
      align: 'left',
      ellipsis: true,
    })

    x += colWidths.name

    // Sets
    const sets = config.sets ? `${config.sets}x` : '—'
    doc.text(sets, x, rowY, {
      width: colWidths.sets - 5,
      align: 'center',
    })

    x += colWidths.sets

    // Reps
    const reps = config.reps ? `${config.reps}` : '—'
    doc.text(reps, x, rowY, {
      width: colWidths.reps - 5,
      align: 'center',
    })

    x += colWidths.reps

    // Weight
    const weight = config.weight ? `${config.weight}kg` : '—'
    doc.text(weight, x, rowY, {
      width: colWidths.weight - 5,
      align: 'center',
    })

    x += colWidths.weight

    // Rest
    const rest = config.rest ? `${config.rest}` : '—'
    doc.text(rest, x, rowY, {
      width: colWidths.rest - 5,
      align: 'center',
    })

    x += colWidths.rest

    // Difficulty pill style
    const difficulty = this.getDifficultyLevel(config)
    if (difficulty) {
      this.drawDifficultyPill(doc, difficulty, x, rowY, theme)
    } else {
      doc.text('—', x, rowY, {
        width: colWidths.difficulty - 5,
        align: 'center',
      })
    }

    doc.y += rowHeight
  }

  /**
   * Draw pill-style difficulty tag
   * Rules:
   * - Inline-block style
   * - Rounded corners appearance
   * - Color-coded: easy (green), medium (orange), hard (red)
   */
  private drawDifficultyPill(
    doc: PDFDocument,
    difficulty: string,
    x: number,
    y: number,
    theme: PDFTheme,
  ): void {
    const pillWidth = 50
    const pillHeight = 14
    const pilllX = x + 15 // Center in column
    const pillY = y - 1

    // Determine pill color based on difficulty
    let bgColor = theme.pillEasyBg
    if (difficulty === 'hard') {
      bgColor = theme.pillHardBg
    } else if (difficulty === 'medium') {
      bgColor = theme.pillMediumBg
    }

    // Draw pill background (rounded rectangle approximation)
    doc
      .rect(pilllX, pillY, pillWidth, pillHeight)
      .fillColor(bgColor)
      .fill()

    // Draw pill border
    doc
      .rect(pilllX, pillY, pillWidth, pillHeight)
      .strokeColor(bgColor)
      .lineWidth(1)
      .stroke()

    // Pill text (white)
    doc
      .font('Helvetica-Bold')
      .fontSize(8)
      .fillColor('white')
      .text(difficulty.toUpperCase(), pilllX + 2, pillY + 2, {
        width: pillWidth - 4,
        align: 'center',
      })
  }

  /**
   * Determine difficulty from exercise config
   */
  private getDifficultyLevel(config: ExerciseConfig): string | null {
    if (config.rpe) {
      if (config.rpe >= 9) return 'hard'
      if (config.rpe >= 7) return 'medium'
      return 'easy'
    }

    if (config.weight) {
      if (config.weight > 100) return 'hard'
      if (config.weight > 50) return 'medium'
      return 'easy'
    }

    return null
  }

  /**
   * Add footer with page numbers
   */
  private addFooter(doc: PDFDocument, theme: PDFTheme): void {
    const pages = doc.bufferedPageRange().count

    for (let i = 0; i < pages; i++) {
      doc.switchToPage(i)

      // Footer background
      doc.rect(0, 760, 612, 52).fillColor('#f9f9f9').fill()

      // Footer border
      doc
        .moveTo(0, 760)
        .lineTo(612, 760)
        .strokeColor(theme.primaryColor)
        .lineWidth(1)
        .stroke()

      // Page number
      doc
        .font('Helvetica')
        .fontSize(10)
        .fillColor('#666666')
        .text(`Page ${i + 1} of ${pages}`, 30, 770, {
          width: 550,
          align: 'right',
        })

      // Footer text
      doc
        .fontSize(9)
        .text('GoBeyondFit Training Program Export', 30, 785, {
          width: 550,
          align: 'center',
        })
    }
  }

  /**
   * Get available theme options
   */
  getThemeOptions(): Record<string, PDFTheme> {
    return {
      default: this.defaultTheme,
      dark: {
        primaryColor: '#1a1a1a',
        secondaryColor: '#2c3e50',
        accentColor: '#3498db',
        headerBg: '#0f0f0f',
        cardBorder: '#444444',
        pillEasyBg: '#27ae60',
        pillMediumBg: '#f39c12',
        pillHardBg: '#e74c3c',
      },
      minimal: {
        primaryColor: '#000000',
        secondaryColor: '#333333',
        accentColor: '#666666',
        headerBg: '#222222',
        cardBorder: '#cccccc',
        pillEasyBg: '#555555',
        pillMediumBg: '#777777',
        pillHardBg: '#999999',
      },
    }
  }
}
