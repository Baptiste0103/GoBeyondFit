import * as XLSX from 'xlsx';
import * as path from 'path';

const excelFile = path.join(__dirname, 'exercises.xlsx');
const workbook = XLSX.readFile(excelFile);
const sheet = workbook.Sheets[workbook.SheetNames[0]];

const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
const headerRowIndex = 14;
const headers = data[headerRowIndex] as string[];

console.log('Row 15 (first data row):');
console.log(data[15]);

console.log('\nRow 16 (second data row):');
console.log(data[16]);

console.log('\nChecking for any hyperlinks in the sheet...');
let foundLinks = 0;
for (const [key, cell] of Object.entries(sheet)) {
  if ((cell as any).l && (cell as any).l.Target) {
    console.log(`Cell ${key}: ${(cell as any).v} -> ${(cell as any).l.Target}`);
    foundLinks++;
    if (foundLinks >= 10) break;
  }
}
console.log(`\nTotal hyperlinks found so far: ${foundLinks}`);

// If no hyperlinks found, check the raw data
if (foundLinks === 0) {
  console.log('\nNo hyperlinks found. Checking cell structures...');
  console.log('Sample cells from row 15:');
  for (let col = 0; col < 5; col++) {
    const cellRef = XLSX.utils.encode_cell({ r: 15, c: col });
    console.log(`  ${cellRef}:`, sheet[cellRef]);
  }
}
