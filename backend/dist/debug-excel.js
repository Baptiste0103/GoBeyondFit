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
const path = __importStar(require("path"));
const excelFile = path.join(__dirname, 'exercises.xlsx');
const workbook = XLSX.readFile(excelFile);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
const headerRowIndex = 14;
const headers = data[headerRowIndex];
console.log('Row 15 (first data row):');
console.log(data[15]);
console.log('\nRow 16 (second data row):');
console.log(data[16]);
console.log('\nChecking for any hyperlinks in the sheet...');
let foundLinks = 0;
for (const [key, cell] of Object.entries(sheet)) {
    if (cell.l && cell.l.Target) {
        console.log(`Cell ${key}: ${cell.v} -> ${cell.l.Target}`);
        foundLinks++;
        if (foundLinks >= 10)
            break;
    }
}
console.log(`\nTotal hyperlinks found so far: ${foundLinks}`);
if (foundLinks === 0) {
    console.log('\nNo hyperlinks found. Checking cell structures...');
    console.log('Sample cells from row 15:');
    for (let col = 0; col < 5; col++) {
        const cellRef = XLSX.utils.encode_cell({ r: 15, c: col });
        console.log(`  ${cellRef}:`, sheet[cellRef]);
    }
}
//# sourceMappingURL=debug-excel.js.map