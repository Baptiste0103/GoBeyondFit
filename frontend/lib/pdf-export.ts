/**
 * PDF Generation Utility for Training Programs
 * Simple, clean text-based format matching coaching document style
 * Guide d'utilisation en première page
 */

import jsPDF from 'jspdf'
import 'jspdf-autotable'

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

interface SessionExercise {
  id: string
  position: number
  exercise: {
    id: string
    name: string
    description?: string
  }
  config?: ExerciseConfig
}

interface Session {
  id: string
  title?: string
  position: number
  date?: string
  exercises: SessionExercise[]
}

interface Week {
  id: string
  weekNumber: number
  position: number
  sessions: Session[]
}

interface Block {
  id: string
  title?: string
  position: number
  weeks: Week[]
}

interface Program {
  id: string
  title: string
  description?: string
  blocks: Block[]
}

interface ProgramPDFOptions {
  filename?: string
  includeNotes?: boolean
  pageSize?: 'a4' | 'letter'
}

/**
 * Generate a clean, simple PDF document formatted as a coaching program
 * with guide at the beginning and proper spacing
 */
export function generateProgramPDF(
  program: Program,
  options: ProgramPDFOptions = {}
) {
  const {
    filename = `${program.title.replace(/\s+/g, '_')}_program.pdf`,
    includeNotes = true,
    pageSize = 'a4',
  } = options

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: pageSize,
  }) as any

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 15
  const contentWidth = pageWidth - 2 * margin
  let currentY = margin
  let pageCount = 1

  // Simple color palette
  const colors = {
    darkGray: [33, 33, 33],
    gray: [80, 80, 80],
    lightGray: [120, 120, 120],
    red: [192, 0, 0],
    blue: [0, 51, 102],
  }

  // Helper: Check and add new page if needed
  const checkNewPage = (neededSpace: number) => {
    const footerSpace = 10
    if (currentY + neededSpace > pageHeight - footerSpace) {
      // Add footer
      doc.setFontSize(7)
      doc.setTextColor(...colors.lightGray)
      doc.text(
        `Page ${pageCount}`,
        pageWidth - margin - 15,
        pageHeight - 5
      )
      doc.addPage()
      currentY = margin
      pageCount++
    }
  }

  // ============ PAGE 1: GUIDE D'UTILISATION ============
  doc.setFontSize(16)
  doc.setTextColor(...colors.blue)
  doc.setFont(undefined, 'bold')
  doc.text('GUIDE D\'UTILISATION', margin, currentY)
  currentY += 12

  // Abbreviations
  const abbreviations = [
    { abbr: 'DS', text: 'Dead Stop - Arrêt complet entre chaque répétition' },
    { abbr: 'OS', text: 'One Shot - Pas d\'arrêt, mouvement fluide' },
    { abbr: 'Unbroken', text: 'Ne pas casser la série mais pause possible si besoin' },
    { abbr: 'EMOM', text: 'À chaque minute, tu fais la série (repos = temps restant)' },
    { abbr: 'AMRAP', text: 'Autant de séries/reps que possible en temps donné' },
    { abbr: 'AFAP', text: 'Aussi vite que possible' },
    { abbr: 'RPE', text: 'Proximité à l\'échec (10 = échec, 9 = 1 rep avant, etc)' },
    { abbr: 'Filme', text: 'À filmer pour vérifier la forme technique' },
  ]

  abbreviations.forEach((item) => {
    checkNewPage(8)

    // Abbreviation label
    doc.setFontSize(10)
    doc.setTextColor(...colors.red)
    doc.setFont(undefined, 'bold')
    doc.text(item.abbr + ':', margin, currentY)

    // Description
    doc.setFontSize(9)
    doc.setTextColor(...colors.darkGray)
    doc.setFont(undefined, 'normal')
    const lines = doc.splitTextToSize(item.text, contentWidth - 35)
    doc.text(lines, margin + 30, currentY)

    currentY += Math.max(5, lines.length * 3.5) + 2
  })

  currentY += 8

  // Example section
  checkNewPage(15)
  doc.setFontSize(12)
  doc.setTextColor(...colors.blue)
  doc.setFont(undefined, 'bold')
  doc.text('EXEMPLE DE LECTURE:', margin, currentY)
  currentY += 8

  doc.setFontSize(10)
  doc.setTextColor(...colors.red)
  doc.setFont(undefined, 'bold')
  doc.text('5*3  8.75kg  4min de repos  DS  Filme', margin, currentY)
  currentY += 7

  doc.setFontSize(9)
  doc.setTextColor(...colors.darkGray)
  doc.setFont(undefined, 'normal')
  const meaning = '= 5 séries de 3 reps | 8.75kg | 4 minutes de repos entre les séries | Dead Stop | À filmer'
  const meaningLines = doc.splitTextToSize(meaning, contentWidth)
  doc.text(meaningLines, margin, currentY)
  currentY += meaningLines.length * 4 + 8

  // Tips section
  checkNewPage(15)
  doc.setFontSize(12)
  doc.setTextColor(...colors.blue)
  doc.setFont(undefined, 'bold')
  doc.text('CONSEILS D\'ENTRAINEMENT:', margin, currentY)
  currentY += 8

  const tips = [
    '✓ Respectez les temps de repos prescrit',
    '✓ Gardez une bonne forme technique',
    '✓ Progressez graduellement (poids ou reps)',
    '✓ Écoutez votre corps et adaptez au besoin',
    '✓ Documentez vos séances et vos progrès',
  ]

  tips.forEach((tip) => {
    checkNewPage(5)
    doc.setFontSize(9)
    doc.setTextColor(...colors.darkGray)
    doc.setFont(undefined, 'normal')
    doc.text(tip, margin, currentY)
    currentY += 5
  })

  // ============ PAGE N: PROGRAMME ============
  checkNewPage(20)

  // Program title
  doc.setFontSize(16)
  doc.setTextColor(...colors.blue)
  doc.setFont(undefined, 'bold')
  doc.text(program.title, margin, currentY)
  currentY += 10

  // Program description
  if (program.description) {
    doc.setFontSize(9)
    doc.setTextColor(...colors.gray)
    doc.setFont(undefined, 'normal')
    const descLines = doc.splitTextToSize(program.description, contentWidth)
    doc.text(descLines, margin, currentY)
    currentY += descLines.length * 3.5 + 6
  }

  // Metadata
  const createdDate = new Date().toLocaleDateString('fr-FR')
  doc.setFontSize(8)
  doc.setTextColor(...colors.lightGray)
  doc.text(`Généré le: ${createdDate}`, margin, currentY)
  currentY += 6

  // Summary statistics
  let totalSessions = 0
  let totalExercises = 0
  program.blocks.forEach((block) => {
    block.weeks.forEach((week) => {
      totalSessions += week.sessions.length
      week.sessions.forEach((session) => {
        totalExercises += session.exercises.length
      })
    })
  })

  doc.setFontSize(8)
  doc.setTextColor(...colors.darkGray)
  doc.text(
    `Blocs: ${program.blocks.length}  •  Semaines: ${program.blocks.reduce((sum, b) => sum + b.weeks.length, 0)}  •  Séances: ${totalSessions}  •  Exercices: ${totalExercises}`,
    margin,
    currentY
  )
  currentY += 8

  // Horizontal line separator
  doc.setDrawColor(...colors.lightGray)
  doc.line(margin, currentY - 1, pageWidth - margin, currentY - 1)
  currentY += 8

  // ============ PROGRAM CONTENT ============
  let globalSessionNumber = 1

  program.blocks.forEach((block, blockIndex) => {
    checkNewPage(10)

    // Block header
    doc.setFontSize(12)
    doc.setTextColor(...colors.blue)
    doc.setFont(undefined, 'bold')
    doc.text(`BLOC ${blockIndex + 1} • ${block.title || `Block ${block.position}`}`, margin, currentY)
    currentY += 8

    // Weeks in block
    block.weeks.forEach((week) => {
      checkNewPage(7)

      // Week header
      doc.setFontSize(10)
      doc.setTextColor(...colors.blue)
      doc.setFont(undefined, 'normal')
      doc.text(`Semaine ${week.weekNumber}`, margin + 3, currentY)
      currentY += 7

      // Sessions in week
      week.sessions.forEach((session) => {
        checkNewPage(12)

        // Session header
        doc.setFontSize(11)
        doc.setTextColor(...colors.blue)
        doc.setFont(undefined, 'bold')
        doc.text(`Séance ${globalSessionNumber} : ${session.title || `Session ${session.position}`}`, margin, currentY)
        currentY += 7

        // Exercises in session
        session.exercises.forEach((ex) => {
          checkNewPage(8)

          // Exercise name (bold red)
          doc.setFontSize(10)
          doc.setTextColor(...colors.red)
          doc.setFont(undefined, 'bold')
          doc.text(ex.exercise.name + ':', margin + 2, currentY)

          // Configuration
          const config = ex.config || {}
          const configParts: string[] = []

          if (config.sets && config.reps) {
            configParts.push(`${config.sets}*${config.reps}`)
          }
          if (config.weight) {
            configParts.push(`${config.weight}kg`)
          }
          if (config.rest) {
            configParts.push(`${config.rest} de repos`)
          }
          if (config.format) {
            configParts.push(config.format)
          }
          if (config.film) {
            configParts.push('Filme')
          }

          const configStr = configParts.join('  ')

          // Configuration on next line
          doc.setFontSize(9)
          doc.setTextColor(...colors.darkGray)
          doc.setFont(undefined, 'normal')
          const configLines = doc.splitTextToSize(configStr, contentWidth - 10)
          doc.text(configLines, margin + 5, currentY + 5)
          currentY += Math.max(5, configLines.length * 3) + 2

          // Notes if present and enabled
          if (config.notes && includeNotes) {
            doc.setFontSize(8)
            doc.setTextColor(...colors.lightGray)
            doc.setFont(undefined, 'italic')
            const noteLines = doc.splitTextToSize(config.notes, contentWidth - 10)
            doc.text(noteLines, margin + 5, currentY)
            currentY += noteLines.length * 2.8 + 1
          }
        })

        currentY += 4
        globalSessionNumber++
      })

      currentY += 4
    })

    currentY += 6
  })

  // Footer
  doc.setFontSize(8)
  doc.setTextColor(...colors.lightGray)
  doc.text(
    'GoBeyondFit • Programme d\'entraînement personnalisé',
    pageWidth / 2,
    pageHeight - 5,
    { align: 'center' }
  )

  // Save PDF
  doc.save(filename)
}

/**
 * Export program as JSON (for backup/import)
 */
export function exportProgramJSON(program: Program, filename?: string) {
  const data = JSON.stringify(program, null, 2)
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename || `${program.title.replace(/\s+/g, '_')}_backup.json`
  link.click()
  URL.revokeObjectURL(url)
}

/**
 * Export program as CSV (for spreadsheet analysis)
 */
export function exportProgramCSV(program: Program, filename?: string) {
  let csv = `"Bloc","Semaine","Session","Exercice","Séries x Reps","Poids","Rest","Format","Notes"\n`

  program.blocks.forEach((block) => {
    block.weeks.forEach((week) => {
      week.sessions.forEach((session) => {
        session.exercises.forEach((ex) => {
          const config = ex.config || {}
          const setsReps = config.sets && config.reps 
            ? `${config.sets}×${config.reps}`
            : `${config.sets || ''}`
          
          csv += `"${block.title || block.position}",${week.weekNumber},"${
            session.title || session.position
          }","${ex.exercise.name}","${setsReps}","${config.weight || ''}","${
            config.rest || ''
          }","${config.format || ''}","${config.notes || ''}"\n`
        })
      })
    })
  })

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename || `${program.title.replace(/\s+/g, '_')}_data.csv`
  link.click()
  URL.revokeObjectURL(url)
}
