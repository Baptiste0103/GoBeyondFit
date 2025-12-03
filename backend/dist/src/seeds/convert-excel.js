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
Object.defineProperty(exports, "__esModule", { value: true });
const XLSX = __importStar(require("xlsx"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const excelFile = path.join(__dirname, '../../exercises.xlsx');
const outputFile = path.join(__dirname, 'exercises.json');
try {
    const workbook = XLSX.readFile(excelFile);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    if (!sheet['!ref']) {
        console.error('Sheet is empty');
        process.exit(1);
    }
    const data = XLSX.utils.sheet_to_json(sheet, {
        header: 1,
        defval: '',
    });
    const headerRowIndex = 14;
    const headers = data[headerRowIndex];
    if (!headers || !headers.length) {
        console.error('Headers not found at row 15');
        process.exit(1);
    }
    console.log('Headers found:', headers);
    const columnsToExtract = [
        'Exercise',
        'Short YouTube Demonstration',
        'In-Depth YouTube Explanation',
        'Difficulty Level',
        'Target Muscle Group',
    ];
    const exercises = [];
    const trimmedHeaders = headers.map(h => h.trim());
    const shortDemoColIndex = trimmedHeaders.indexOf('Short YouTube Demonstration');
    const inDepthColIndex = trimmedHeaders.indexOf('In-Depth YouTube Explanation');
    console.log(`Short Demo column: ${shortDemoColIndex}, In-Depth column: ${inDepthColIndex}`);
    const dataStartRow = 16;
    for (let i = dataStartRow; i < data.length; i++) {
        const row = data[i];
        if (!row || !row[0])
            break;
        const exercise = {};
        columnsToExtract.forEach((colName) => {
            const headerIndex = trimmedHeaders.indexOf(colName);
            if (headerIndex !== -1) {
                exercise[colName.replace(/\s+/g, '_').toLowerCase()] = row[headerIndex] || '';
            }
        });
        const exerciseName = row[headers.indexOf('Exercise')] || '';
        if (shortDemoColIndex !== -1) {
            const cellRef = XLSX.utils.encode_cell({ r: i, c: shortDemoColIndex });
            const cell = sheet[cellRef];
            if (cell && cell.l && cell.l.Target) {
                exercise.short_demonstration_link = cell.l.Target;
            }
        }
        if (inDepthColIndex !== -1) {
            const cellRef = XLSX.utils.encode_cell({ r: i, c: inDepthColIndex });
            const cell = sheet[cellRef];
            if (cell && cell.l && cell.l.Target) {
                exercise.indepth_explanation_link = cell.l.Target;
            }
        }
        if (exerciseName.trim()) {
            exercises.push(exercise);
        }
    }
    console.log(`\n✅ Extracted ${exercises.length} exercises`);
    console.log('\nSample exercise:');
    console.log(JSON.stringify(exercises[0], null, 2));
    fs.writeFileSync(outputFile, JSON.stringify(exercises, null, 2));
    console.log(`\n✅ Saved to ${outputFile}`);
}
catch (error) {
    console.error('Error converting Excel to JSON:', error.message);
    process.exit(1);
}
//# sourceMappingURL=convert-excel.js.map