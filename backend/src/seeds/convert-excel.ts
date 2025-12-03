import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

const excelFile = path.join(__dirname, '../../exercises.xlsx');
const outputFile = path.join(__dirname, 'exercises.json');

try {
  // Read Excel file
  const workbook = XLSX.readFile(excelFile);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];

  // Get cell range
  if (!sheet['!ref']) {
    console.error('Sheet is empty');
    process.exit(1);
  }

  // Parse with formulas to get hyperlinks
  const data = XLSX.utils.sheet_to_json(sheet, { 
    header: 1,
    defval: '',
  });

  // Skip rows until we find the header row (row 14, 0-indexed)
  const headerRowIndex = 14;
  const headers = data[headerRowIndex] as string[];
  
  if (!headers || !headers.length) {
    console.error('Headers not found at row 15');
    process.exit(1);
  }

  console.log('Headers found:', headers);

  // Columns to extract (first 5: Exercise, Short YouTube Demonstration, In-Depth YouTube Explanation, Difficulty Level, Target Muscle Group)
  const columnsToExtract = [
    'Exercise',
    'Short YouTube Demonstration',
    'In-Depth YouTube Explanation',
    'Difficulty Level',
    'Target Muscle Group',
  ];

  const exercises: any[] = [];

  // Trim all headers to handle trailing spaces
  const trimmedHeaders = headers.map(h => h.trim());

  // Get column indices for hyperlinks
  const shortDemoColIndex = trimmedHeaders.indexOf('Short YouTube Demonstration');
  const inDepthColIndex = trimmedHeaders.indexOf('In-Depth YouTube Explanation');

  console.log(`Short Demo column: ${shortDemoColIndex}, In-Depth column: ${inDepthColIndex}`);

  // Data starts at row 16 (0-indexed), not row 15!
  const dataStartRow = 16;

  // Process rows starting from actual data row
  for (let i = dataStartRow; i < data.length; i++) {
    const row = data[i] as string[];
    
    if (!row || !row[0]) break; // Stop at empty row

    const exercise: any = {};
    
    columnsToExtract.forEach((colName) => {
      const headerIndex = trimmedHeaders.indexOf(colName);
      if (headerIndex !== -1) {
        exercise[colName.replace(/\s+/g, '_').toLowerCase()] = row[headerIndex] || '';
      }
    });

    const exerciseName = row[headers.indexOf('Exercise')] || '';

    // Try to extract hyperlinks from cells using correct row index
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

  // Write to JSON file
  fs.writeFileSync(outputFile, JSON.stringify(exercises, null, 2));
  console.log(`\n✅ Saved to ${outputFile}`);

} catch (error: any) {
  console.error('Error converting Excel to JSON:', error.message);
  process.exit(1);
}
