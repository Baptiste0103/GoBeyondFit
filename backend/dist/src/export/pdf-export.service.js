"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var PdfExportService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdfExportService = void 0;
const common_1 = require("@nestjs/common");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const puppeteer = require('puppeteer');
let PdfExportService = PdfExportService_1 = class PdfExportService {
    logger = new common_1.Logger(PdfExportService_1.name);
    browser = null;
    async initializeBrowser() {
        try {
            if (!this.browser) {
                this.logger.log('Initializing Puppeteer browser in headless mode...');
                this.browser = await puppeteer.launch({
                    headless: true,
                    args: [
                        '--no-sandbox',
                        '--disable-setuid-sandbox',
                        '--disable-dev-shm-usage',
                        '--disable-gpu',
                        '--disable-software-rasterizer',
                        '--disable-extensions',
                    ],
                });
                this.logger.log('Puppeteer browser initialized successfully');
            }
        }
        catch (error) {
            this.logger.error(`Failed to initialize browser: ${error.message}`);
            throw new common_1.BadRequestException('Failed to initialize PDF engine');
        }
    }
    async closeBrowser() {
        if (this.browser) {
            try {
                await this.browser.close();
                this.browser = null;
                this.logger.log('Puppeteer browser closed');
            }
            catch (error) {
                this.logger.error(`Failed to close browser: ${error.message}`);
            }
        }
    }
    generateHTMLContent(program) {
        const escapeHtml = (text) => {
            const map = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#039;',
            };
            return text.replace(/[&<>"']/g, (m) => map[m]);
        };
        let totalSessions = 0;
        let totalExercises = 0;
        program.blocks.forEach((block) => {
            block.weeks.forEach((week) => {
                totalSessions += week.sessions.length;
                week.sessions.forEach((session) => {
                    totalExercises += session.exercises.length;
                });
            });
        });
        const createdDate = new Date().toLocaleDateString('fr-FR');
        let html = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${escapeHtml(program.title)}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #212121;
          background: #ffffff;
          padding: 0;
        }

        .page {
          page-break-after: always;
          padding: 40mm;
          min-height: 297mm;
          background: white;
        }

        @media print {
          body {
            margin: 0;
            padding: 0;
          }
          .page {
            page-break-after: always;
            padding: 40mm;
            margin: 0;
            box-shadow: none;
          }
        }

        /* Header */
        .guide-header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 3px solid #003366;
          padding-bottom: 20px;
        }

        .guide-title {
          font-size: 28px;
          font-weight: bold;
          color: #003366;
          margin-bottom: 10px;
        }

        /* Abbreviations Section */
        .abbr-item {
          margin-bottom: 20px;
          padding: 15px;
          background: #f5f5f5;
          border-left: 4px solid #c00000;
          border-radius: 4px;
        }

        .abbr-label {
          font-weight: bold;
          color: #c00000;
          font-size: 14px;
          margin-bottom: 8px;
        }

        .abbr-text {
          color: #505050;
          font-size: 13px;
          line-height: 1.5;
        }

        /* Example Section */
        .example-section {
          margin: 40px 0;
          padding: 20px;
          background: #f9f9f9;
          border-radius: 4px;
        }

        .section-title {
          font-size: 16px;
          font-weight: bold;
          color: #003366;
          margin-bottom: 15px;
          text-transform: uppercase;
          border-bottom: 2px solid #003366;
          padding-bottom: 10px;
        }

        .example-code {
          background: white;
          border-left: 4px solid #c00000;
          padding: 12px;
          margin: 10px 0;
          font-family: 'Courier New', monospace;
          font-size: 13px;
          color: #c00000;
          font-weight: bold;
        }

        .example-meaning {
          color: #505050;
          font-size: 12px;
          margin-top: 8px;
          font-style: italic;
        }

        /* Tips Section */
        .tips-item {
          padding: 8px 0;
          margin: 5px 0;
          color: #505050;
          font-size: 12px;
          padding-left: 20px;
        }

        /* Program Header */
        .program-header {
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 3px solid #003366;
        }

        .program-title {
          font-size: 32px;
          font-weight: bold;
          color: #003366;
          margin-bottom: 12px;
        }

        .program-description {
          color: #505050;
          font-size: 13px;
          margin-bottom: 12px;
          line-height: 1.6;
        }

        .program-meta {
          font-size: 11px;
          color: #888888;
          margin-bottom: 8px;
        }

        .program-stats {
          font-size: 12px;
          color: #212121;
          font-weight: 600;
          margin-top: 8px;
        }

        /* Block */
        .block {
          margin: 30px 0;
          page-break-inside: avoid;
        }

        .block-header {
          font-size: 18px;
          font-weight: bold;
          color: #003366;
          margin-bottom: 15px;
          padding-bottom: 10px;
          border-bottom: 2px solid #e0e0e0;
        }

        /* Week */
        .week {
          margin: 20px 0;
          margin-left: 15px;
        }

        .week-header {
          font-size: 15px;
          color: #003366;
          font-weight: 600;
          margin-bottom: 12px;
          margin-left: 0;
        }

        /* Session */
        .session {
          margin: 15px 0;
          margin-left: 15px;
          padding: 12px;
          background: #f9f9f9;
          border-left: 3px solid #003366;
          border-radius: 2px;
        }

        .session-header {
          font-size: 14px;
          font-weight: bold;
          color: #003366;
          margin-bottom: 10px;
        }

        /* Exercise */
        .exercise {
          margin: 10px 0;
          padding: 10px;
          background: white;
          border-left: 2px solid #888888;
        }

        .exercise-name {
          font-weight: bold;
          color: #c00000;
          font-size: 13px;
          margin-bottom: 6px;
        }

        .exercise-config {
          color: #212121;
          font-size: 12px;
          margin-bottom: 4px;
          font-family: 'Courier New', monospace;
        }

        .exercise-notes {
          color: #888888;
          font-size: 11px;
          font-style: italic;
          margin-top: 4px;
        }

        /* Footer */
        .footer {
          text-align: center;
          font-size: 11px;
          color: #888888;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e0e0e0;
        }

        .page-number {
          text-align: right;
          font-size: 10px;
          color: #aaaaaa;
          margin-top: 20px;
        }
      </style>
    </head>
    <body>
    `;
        html += `
    <div class="page">
      <div class="guide-header">
        <div class="guide-title">GUIDE D'UTILISATION</div>
      </div>

      <div class="abbr-item">
        <div class="abbr-label">DS (Dead Stop)</div>
        <div class="abbr-text">Arrêt complet entre chaque répétition</div>
      </div>

      <div class="abbr-item">
        <div class="abbr-label">OS (One Shot)</div>
        <div class="abbr-text">Pas d'arrêt, mouvement fluide</div>
      </div>

      <div class="abbr-item">
        <div class="abbr-label">Unbroken</div>
        <div class="abbr-text">Ne pas casser la série mais pause possible si besoin</div>
      </div>

      <div class="abbr-item">
        <div class="abbr-label">EMOM</div>
        <div class="abbr-text">À chaque minute, tu fais la série (repos = temps restant)</div>
      </div>

      <div class="abbr-item">
        <div class="abbr-label">AMRAP</div>
        <div class="abbr-text">Autant de séries/reps que possible en temps donné</div>
      </div>

      <div class="abbr-item">
        <div class="abbr-label">AFAP</div>
        <div class="abbr-text">Aussi vite que possible</div>
      </div>

      <div class="abbr-item">
        <div class="abbr-label">RPE</div>
        <div class="abbr-text">Proximité à l'échec (10 = échec, 9 = 1 rep avant, etc)</div>
      </div>

      <div class="abbr-item">
        <div class="abbr-label">Filme</div>
        <div class="abbr-text">À filmer pour vérifier la forme technique</div>
      </div>

      <div class="example-section">
        <div class="section-title">Exemple de lecture</div>
        <div class="example-code">5*3  8.75kg  4min de repos  DS  Filme</div>
        <div class="example-meaning">
          = 5 séries de 3 reps | 8.75kg | 4 minutes de repos entre les séries | Dead Stop | À filmer
        </div>
      </div>

      <div class="example-section">
        <div class="section-title">Conseils d'entraînement</div>
        <div class="tips-item">✓ Respectez les temps de repos prescrit</div>
        <div class="tips-item">✓ Gardez une bonne forme technique</div>
        <div class="tips-item">✓ Progressez graduellement (poids ou reps)</div>
        <div class="tips-item">✓ Écoutez votre corps et adaptez au besoin</div>
        <div class="tips-item">✓ Documentez vos séances et vos progrès</div>
      </div>
    </div>
    `;
        html += `
    <div class="page">
      <div class="program-header">
        <div class="program-title">${escapeHtml(program.title)}</div>
        ${program.description ? `<div class="program-description">${escapeHtml(program.description)}</div>` : ''}
        <div class="program-meta">Généré le: ${createdDate}</div>
        <div class="program-stats">
          Blocs: ${program.blocks.length} • Semaines: ${program.blocks.reduce((sum, b) => sum + b.weeks.length, 0)} • 
          Séances: ${totalSessions} • Exercices: ${totalExercises}
        </div>
      </div>
    `;
        let globalSessionNumber = 1;
        let pageCount = 2;
        program.blocks.forEach((block, blockIndex) => {
            html += `
      <div class="block">
        <div class="block-header">BLOC ${blockIndex + 1} • ${escapeHtml(block.title || `Block ${blockIndex + 1}`)}</div>
      `;
            block.weeks.forEach((week) => {
                html += `
        <div class="week">
          <div class="week-header">Semaine ${week.weekNumber}</div>
        `;
                week.sessions.forEach((session) => {
                    html += `
          <div class="session">
            <div class="session-header">Séance ${globalSessionNumber}: ${escapeHtml(session.title || `Session ${session.id.slice(0, 4)}`)}</div>
          `;
                    session.exercises.forEach((exercise) => {
                        const config = exercise.config || {};
                        let configStr = '';
                        if (config.sets && config.reps) {
                            configStr += `${config.sets}*${config.reps}  `;
                        }
                        if (config.weight) {
                            configStr += `${config.weight}kg  `;
                        }
                        if (config.rest) {
                            configStr += `${config.rest}  `;
                        }
                        if (config.format) {
                            configStr += `${config.format}  `;
                        }
                        if (config.film) {
                            configStr += `Filme`;
                        }
                        html += `
            <div class="exercise">
              <div class="exercise-name">${escapeHtml(exercise.name)}</div>
              <div class="exercise-config">${escapeHtml(configStr.trim())}</div>
              ${config.notes ? `<div class="exercise-notes">${escapeHtml(config.notes)}</div>` : ''}
            </div>
            `;
                    });
                    html += `</div>`;
                    globalSessionNumber++;
                });
                html += `</div>`;
            });
            html += `</div>`;
        });
        html += `
    </div>
    <div class="footer">
      GoBeyondFit • Programme d'entraînement personnalisé
    </div>
    `;
        html += `
    </body>
    </html>
    `;
        return html;
    }
    async generateProgramPDF(program) {
        let page = null;
        try {
            await this.initializeBrowser();
            if (!this.browser) {
                throw new Error('Browser not initialized');
            }
            page = await this.browser.newPage();
            await page.setViewport({ width: 1920, height: 1080 });
            const htmlContent = this.generateHTMLContent(program);
            await page.setContent(htmlContent, {
                waitUntil: 'networkidle0',
            });
            const pdfBuffer = await page.pdf({
                format: 'A4',
                margin: {
                    top: '0mm',
                    right: '0mm',
                    bottom: '0mm',
                    left: '0mm',
                },
                printBackground: true,
                preferCSSPageSize: true,
            });
            this.logger.log(`PDF generated successfully for program: ${program.title}`);
            return pdfBuffer;
        }
        catch (error) {
            this.logger.error(`Failed to generate PDF: ${error.message}`);
            throw new common_1.BadRequestException(`Failed to generate PDF: ${error.message}`);
        }
        finally {
            if (page) {
                await page.close();
            }
        }
    }
    async exportPDFToFile(pdfBuffer, filename) {
        try {
            const uploadsDir = path.join(process.cwd(), 'uploads', 'pdfs');
            if (!fs.existsSync(uploadsDir)) {
                fs.mkdirSync(uploadsDir, { recursive: true });
            }
            const filePath = path.join(uploadsDir, filename);
            fs.writeFileSync(filePath, pdfBuffer);
            this.logger.log(`PDF exported to: ${filePath}`);
            return filePath;
        }
        catch (error) {
            this.logger.error(`Failed to export PDF to file: ${error.message}`);
            throw new common_1.BadRequestException(`Failed to export PDF: ${error.message}`);
        }
    }
};
exports.PdfExportService = PdfExportService;
exports.PdfExportService = PdfExportService = PdfExportService_1 = __decorate([
    (0, common_1.Injectable)()
], PdfExportService);
//# sourceMappingURL=pdf-export.service.js.map