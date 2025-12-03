import * as XLSX from 'xlsx';
import * as path from 'path';

const excelFile = path.join(__dirname, '../../exercises.xlsx');
console.log('Reading from:', excelFile);
const workbook = XLSX.readFile(excelFile, { cellFormula: true, cellStyles: true });
const sheet = workbook.Sheets[workbook.SheetNames[0]];

// Find header row
const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
const headerRowIndex = 14;
const headers = data[headerRowIndex] as string[];

console.log('Looking for column indices...');
console.log('Short Demo col:', headers.indexOf('Short YouTube Demonstration'));
console.log('In-Depth col:', headers.indexOf('In-Depth YouTube Explanation'));

// Check a few cells directly
console.log('\nChecking cells for hyperlinks...');
for (let row = 15; row < 20; row++) {
  const shortDemoCell = XLSX.utils.encode_cell({ r: row, c: headers.indexOf('Short YouTube Demonstration') });
  const inDepthCell = XLSX.utils.encode_cell({ r: row, c: headers.indexOf('In-Depth YouTube Explanation') });
  
  console.log(`Row ${row}:`);
  console.log(`  ${shortDemoCell}:`, sheet[shortDemoCell] ? { v: sheet[shortDemoCell].v, l: sheet[shortDemoCell].l } : 'empty');
  console.log(`  ${inDepthCell}:`, sheet[inDepthCell] ? { v: sheet[inDepthCell].v, l: sheet[inDepthCell].l } : 'empty');
}

// List all keys in sheet to understand structure
console.log('\nAll sheet keys (first 50):');
console.log(Object.keys(sheet).slice(0, 50));
