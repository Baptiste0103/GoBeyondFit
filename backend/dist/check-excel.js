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
const excelFile = path.join(__dirname, '../../exercises.xlsx');
console.log('Reading from:', excelFile);
const workbook = XLSX.readFile(excelFile, { cellFormula: true, cellStyles: true });
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
const headerRowIndex = 14;
const headers = data[headerRowIndex];
console.log('Looking for column indices...');
console.log('Short Demo col:', headers.indexOf('Short YouTube Demonstration'));
console.log('In-Depth col:', headers.indexOf('In-Depth YouTube Explanation'));
console.log('\nChecking cells for hyperlinks...');
for (let row = 15; row < 20; row++) {
    const shortDemoCell = XLSX.utils.encode_cell({ r: row, c: headers.indexOf('Short YouTube Demonstration') });
    const inDepthCell = XLSX.utils.encode_cell({ r: row, c: headers.indexOf('In-Depth YouTube Explanation') });
    console.log(`Row ${row}:`);
    console.log(`  ${shortDemoCell}:`, sheet[shortDemoCell] ? { v: sheet[shortDemoCell].v, l: sheet[shortDemoCell].l } : 'empty');
    console.log(`  ${inDepthCell}:`, sheet[inDepthCell] ? { v: sheet[inDepthCell].v, l: sheet[inDepthCell].l } : 'empty');
}
console.log('\nAll sheet keys (first 50):');
console.log(Object.keys(sheet).slice(0, 50));
//# sourceMappingURL=check-excel.js.map