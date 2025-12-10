"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var PdtkitExportService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdtkitExportService = void 0;
const common_1 = require("@nestjs/common");
const pdfkit_1 = __importDefault(require("pdfkit"));
let PdtkitExportService = PdtkitExportService_1 = class PdtkitExportService {
    logger = new common_1.Logger(PdtkitExportService_1.name);
    defaultTheme = {
        primaryColor: '#2E7D32',
        secondaryColor: '#1565C0',
        accentColor: '#FF6F00',
        headerBg: '#333333',
        cardBorder: '#eeeeee',
        pillEasyBg: '#27ae60',
        pillMediumBg: '#f39c12',
        pillHardBg: '#e74c3c',
    };
    async generateProgramPDF(program, theme) {
        return new Promise((resolve, reject) => {
            try {
                const doc = new pdfkit_1.default({
                    size: 'A4',
                    margin: 0,
                    bufferPages: true,
                });
                const buffers = [];
                doc.on('data', (chunk) => buffers.push(chunk));
                doc.on('end', () => resolve(Buffer.concat(buffers)));
                doc.on('error', reject);
                const finalTheme = { ...this.defaultTheme, ...theme };
                this.renderProgramPDF(doc, program, finalTheme);
                doc.end();
            }
            catch (error) {
                this.logger.error(`PDF generation error: ${error.message}`);
                reject(error);
            }
        });
    }
    renderProgramPDF(doc, program, theme) {
        this.addHeader(doc, program, theme);
        if (program.description) {
            this.addDescription(doc, program.description, theme);
        }
        program.blocks.forEach((block, blockIdx) => {
            this.renderBlock(doc, block, blockIdx + 1, theme);
        });
        this.addFooter(doc, theme);
    }
    addHeader(doc, program, theme) {
        doc.rect(0, 0, 612, 80).fillColor(theme.headerBg).fill();
        doc
            .fillColor('white')
            .font('Helvetica-Bold')
            .fontSize(24)
            .text(program.title, 30, 15, {
            width: 550,
            align: 'left',
        });
        doc
            .font('Helvetica')
            .fontSize(10)
            .text(`Generated: ${new Date().toLocaleDateString()} | Page PDF Export`, 30, 50, {
            width: 550,
            align: 'left',
        });
        doc.y = 90;
    }
    addDescription(doc, description, theme) {
        if (doc.y > 740) {
            doc.addPage();
            doc.y = 30;
        }
        doc.rect(0, doc.y - 5, 612, 40).fillColor('#f9f9f9').fill();
        doc
            .fillColor('#333333')
            .font('Helvetica')
            .fontSize(11)
            .text(description, 30, doc.y, {
            width: 550,
            align: 'left',
        });
        doc.y += 30;
    }
    renderBlock(doc, block, blockNumber, theme) {
        if (doc.y > 740) {
            doc.addPage();
            doc.y = 30;
        }
        doc
            .fillColor(theme.primaryColor)
            .font('Helvetica-Bold')
            .fontSize(14)
            .text(`Block ${blockNumber}: ${block.title || 'Training Block'}`, 30, doc.y, {
            width: 550,
        });
        doc.y += 20;
        block.weeks.forEach((week) => {
            this.renderWeek(doc, week, theme);
        });
    }
    renderWeek(doc, week, theme) {
        if (doc.y > 740) {
            doc.addPage();
            doc.y = 30;
        }
        doc
            .fillColor(theme.secondaryColor)
            .font('Helvetica-Bold')
            .fontSize(12)
            .text(`Week ${week.weekNumber}`, 40, doc.y);
        doc.y += 15;
        week.sessions.forEach((session, idx) => {
            this.renderSession(doc, session, idx + 1, theme);
        });
        doc.y += 10;
    }
    renderSession(doc, session, sessionNumber, theme) {
        if (doc.y > 740) {
            doc.addPage();
            doc.y = 30;
        }
        doc
            .fillColor(theme.accentColor)
            .font('Helvetica-Bold')
            .fontSize(11)
            .text(`Session ${sessionNumber}${session.title ? `: ${session.title}` : ''}`, 50, doc.y);
        doc.y += 12;
        this.renderExercisesTable(doc, session.exercises, theme);
    }
    renderExercisesTable(doc, exercises, theme) {
        if (!exercises || exercises.length === 0) {
            return;
        }
        const startX = 60;
        const tableWidth = 490;
        const colWidths = {
            name: 180,
            sets: 50,
            reps: 50,
            weight: 70,
            rest: 60,
            difficulty: 80,
        };
        this.drawTableHeader(doc, startX, tableWidth, colWidths, theme);
        doc.y += 2;
        exercises.forEach((exercise, idx) => {
            if (doc.y > 740) {
                doc.addPage();
                doc.y = 30;
            }
            this.renderExerciseRow(doc, exercise, idx, startX, colWidths, theme);
        });
        doc.y += 10;
    }
    drawTableHeader(doc, startX, tableWidth, colWidths, theme) {
        const headers = ['Exercise', 'Sets', 'Reps', 'Weight', 'Rest', 'Difficulty'];
        doc
            .rect(startX, doc.y, tableWidth, 18)
            .fillColor('#f0f0f0')
            .fill();
        doc
            .rect(startX, doc.y, tableWidth, 18)
            .strokeColor(theme.cardBorder)
            .lineWidth(1)
            .stroke();
        doc
            .font('Helvetica-Bold')
            .fontSize(9)
            .fillColor('#333333');
        let x = startX + 5;
        headers.forEach((header, idx) => {
            const width = Object.values(colWidths)[idx];
            doc.text(header, x, doc.y + 4, {
                width: width - 10,
                align: 'left',
            });
            x += width;
        });
        doc.y += 18;
    }
    renderExerciseRow(doc, exercise, idx, startX, colWidths, theme) {
        const config = exercise.config || {};
        const rowHeight = 24;
        const isAlternate = idx % 2 === 0;
        if (isAlternate) {
            doc
                .rect(startX, doc.y, Object.values(colWidths).reduce((a, b) => a + b), rowHeight)
                .fillColor('#fafafa')
                .fill();
        }
        doc
            .rect(startX, doc.y, Object.values(colWidths).reduce((a, b) => a + b), rowHeight)
            .strokeColor(theme.cardBorder)
            .lineWidth(0.5)
            .stroke();
        doc
            .font('Helvetica')
            .fontSize(9)
            .fillColor('#333333');
        let x = startX + 5;
        const rowY = doc.y + 5;
        doc.text(exercise.name, x, rowY, {
            width: colWidths.name - 10,
            align: 'left',
            ellipsis: true,
        });
        x += colWidths.name;
        const sets = config.sets ? `${config.sets}x` : '—';
        doc.text(sets, x, rowY, {
            width: colWidths.sets - 5,
            align: 'center',
        });
        x += colWidths.sets;
        const reps = config.reps ? `${config.reps}` : '—';
        doc.text(reps, x, rowY, {
            width: colWidths.reps - 5,
            align: 'center',
        });
        x += colWidths.reps;
        const weight = config.weight ? `${config.weight}kg` : '—';
        doc.text(weight, x, rowY, {
            width: colWidths.weight - 5,
            align: 'center',
        });
        x += colWidths.weight;
        const rest = config.rest ? `${config.rest}` : '—';
        doc.text(rest, x, rowY, {
            width: colWidths.rest - 5,
            align: 'center',
        });
        x += colWidths.rest;
        const difficulty = this.getDifficultyLevel(config);
        if (difficulty) {
            this.drawDifficultyPill(doc, difficulty, x, rowY, theme);
        }
        else {
            doc.text('—', x, rowY, {
                width: colWidths.difficulty - 5,
                align: 'center',
            });
        }
        doc.y += rowHeight;
    }
    drawDifficultyPill(doc, difficulty, x, y, theme) {
        const pillWidth = 50;
        const pillHeight = 14;
        const pilllX = x + 15;
        const pillY = y - 1;
        let bgColor = theme.pillEasyBg;
        if (difficulty === 'hard') {
            bgColor = theme.pillHardBg;
        }
        else if (difficulty === 'medium') {
            bgColor = theme.pillMediumBg;
        }
        doc
            .rect(pilllX, pillY, pillWidth, pillHeight)
            .fillColor(bgColor)
            .fill();
        doc
            .rect(pilllX, pillY, pillWidth, pillHeight)
            .strokeColor(bgColor)
            .lineWidth(1)
            .stroke();
        doc
            .font('Helvetica-Bold')
            .fontSize(8)
            .fillColor('white')
            .text(difficulty.toUpperCase(), pilllX + 2, pillY + 2, {
            width: pillWidth - 4,
            align: 'center',
        });
    }
    getDifficultyLevel(config) {
        if (config.rpe) {
            if (config.rpe >= 9)
                return 'hard';
            if (config.rpe >= 7)
                return 'medium';
            return 'easy';
        }
        if (config.weight) {
            if (config.weight > 100)
                return 'hard';
            if (config.weight > 50)
                return 'medium';
            return 'easy';
        }
        return null;
    }
    addFooter(doc, theme) {
        const pages = doc.bufferedPageRange().count;
        for (let i = 0; i < pages; i++) {
            doc.switchToPage(i);
            doc.rect(0, 760, 612, 52).fillColor('#f9f9f9').fill();
            doc
                .moveTo(0, 760)
                .lineTo(612, 760)
                .strokeColor(theme.primaryColor)
                .lineWidth(1)
                .stroke();
            doc
                .font('Helvetica')
                .fontSize(10)
                .fillColor('#666666')
                .text(`Page ${i + 1} of ${pages}`, 30, 770, {
                width: 550,
                align: 'right',
            });
            doc
                .fontSize(9)
                .text('GoBeyondFit Training Program Export', 30, 785, {
                width: 550,
                align: 'center',
            });
        }
    }
    getThemeOptions() {
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
        };
    }
};
exports.PdtkitExportService = PdtkitExportService;
exports.PdtkitExportService = PdtkitExportService = PdtkitExportService_1 = __decorate([
    (0, common_1.Injectable)()
], PdtkitExportService);
//# sourceMappingURL=pdfkit-export.service.js.map