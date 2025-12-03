import * as XLSX from 'xlsx';
import * as path from 'path';

const excelFile = path.join(__dirname, '../../exercises.xlsx');

try {
  const workbook = XLSX.readFile(excelFile);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];

  const data = XLSX.utils.sheet_to_json(sheet, { 
    header: 1,
    defval: '',
  });

  const headers = data[14] as string[];
  
  console.log('📋 Headers at row 15 (0-indexed as 14):');
  for (let i = 0; i < headers.length; i++) {
    console.log(`  [${i}] ${headers[i]}`);
  }
  
  console.log('\n📊 Sample data row 17:');
  const sampleRow = data[16] as string[];
  for (let i = 0; i < Math.min(6, sampleRow.length); i++) {
    console.log(`  [${i}] ${headers[i]}: "${sampleRow[i]}"`);
  }
} catch (error) {
  console.error('Error:', error);
}
