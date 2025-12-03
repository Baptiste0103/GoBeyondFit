/**
 * Script pour convertir le fichier Excel d'exercices en JSON
 * Extrait les colonnes : Exercise, Short YouTube, Difficulty, Target Muscle Group
 * et conserve les liens hypertexte
 */

const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Chemins
const excelFilePath = path.join(__dirname, '../Functional+Fitness+Exercise+Database+(version+2.9).xlsx');
const jsonOutputPath = path.join(__dirname, '../backend/src/seeds/exercises-database.json');

// Colonnes à extraire (index basé sur le fichier)
const COLUMNS_TO_EXTRACT = [
  'Exercise',                // Column A
  'Short YouTube Demonstration', // Column B (lien court)
  'In-Depth YouTube Explanation', // Column C (lien détaillé)
  'Difficulty Level',        // Column D
  'Target Muscle Group',     // Column E
];

/**
 * Extraire les exercices du fichier Excel
 */
function extractExercises() {
  try {
    console.log('📖 Lecture du fichier Excel...');
    
    // Lire le fichier Excel avec header: 1 pour obtenir les données brutes
    const workbook = XLSX.readFile(excelFilePath);
    const worksheet = workbook.Sheets['Exercises'] || workbook.Sheets[workbook.SheetNames[0]];
    
    // Obtenir les données brutes (array de arrays)
    const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    // Les en-têtes sont à la ligne 15 (index 14)
    const headerRow = rawData[14];
    if (!headerRow) {
      throw new Error('Impossible de trouver la ligne d\'en-tête');
    }
    
    // Trouver les indices des colonnes
    const colIndices = {
      Exercise: headerRow.indexOf('Exercise'),
      shortDemo: headerRow.indexOf('Short YouTube Demonstration'),
      inDepthDemo: headerRow.indexOf('In-Depth YouTube Explanation'),
      difficulty: headerRow.indexOf('Difficulty Level'),
      targetMuscle: headerRow.indexOf('Target Muscle Group'),
      primeMover: headerRow.indexOf('Prime Mover Muscle'),
      secondary: headerRow.indexOf('Secondary Muscle'),
      tertiary: headerRow.indexOf('Tertiary Muscle'),
      equipment: headerRow.indexOf('Primary Equipment'),
      pattern: headerRow.indexOf('Movement Pattern #1'),
      body: headerRow.indexOf('Body Region'),
      force: headerRow.indexOf('Force Type'),
      mechanics: headerRow.indexOf('Mechanics'),
    };
    
    // Vérifier que les colonnes essentielles existent
    if (colIndices.Exercise < 0) {
      throw new Error('Colonne "Exercise" non trouvée');
    }
    
    // Mapper les données (à partir de la ligne 16, index 15)
    const exercises = [];
    
    for (let i = 15; i < rawData.length; i++) {
      const row = rawData[i];
      
      if (!row[colIndices.Exercise] || !row[colIndices.Exercise].toString().trim()) {
        continue; // Ignorer les lignes vides
      }
      
      const exercise = {
        id: generateId(row[colIndices.Exercise]),
        name: row[colIndices.Exercise]?.toString().trim() || '',
        shortDemonstration: extractUrl(row[colIndices.shortDemo]) || null,
        inDepthExplanation: extractUrl(row[colIndices.inDepthDemo]) || null,
        difficultyLevel: row[colIndices.difficulty]?.toString().trim() || 'Beginner',
        targetMuscleGroup: row[colIndices.targetMuscle]?.toString().trim() || 'General',
        
        // Colonnes supplémentaires
        primeMoverMuscle: row[colIndices.primeMover]?.toString().trim() || null,
        secondaryMuscle: row[colIndices.secondary]?.toString().trim() || null,
        tertiaryMuscle: row[colIndices.tertiary]?.toString().trim() || null,
        primaryEquipment: row[colIndices.equipment]?.toString().trim() || null,
        movementPattern: row[colIndices.pattern]?.toString().trim() || null,
        bodyRegion: row[colIndices.body]?.toString().trim() || null,
        forceType: row[colIndices.force]?.toString().trim() || null,
        mechanics: row[colIndices.mechanics]?.toString().trim() || null,
      };
      
      exercises.push(exercise);
    }
    
    console.log(`✅ ${exercises.length} exercices extraits`);
    
    return exercises;
  } catch (error) {
    console.error('❌ Erreur lors de la lecture du fichier Excel:', error.message);
    throw error;
  }
}

/**
 * Extraire l'URL d'une cellule contenant un lien hypertexte
 */
function extractUrl(cell) {
  if (!cell) return null;
  
  // Si c'est une string normale
  if (typeof cell === 'string') {
    // Vérifier si c'est une URL
    if (cell.includes('http')) {
      return cell;
    }
    // Sinon retourner null
    return null;
  }
  
  return null;
}

/**
 * Générer un ID unique basé sur le nom de l'exercice
 */
function generateId(exerciseName) {
  return exerciseName
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '')
    .substring(0, 50);
}

/**
 * Créer le répertoire s'il n'existe pas
 */
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`📁 Répertoire créé: ${dirPath}`);
  }
}

/**
 * Main
 */
function main() {
  try {
    console.log('🚀 Démarrage de la conversion Excel → JSON\n');
    
    // Extraire les exercices
    const exercises = extractExercises();
    
    // Créer le répertoire si nécessaire
    ensureDir(path.dirname(jsonOutputPath));
    
    // Écrire le JSON
    const output = {
      version: '2.9',
      lastUpdated: new Date().toISOString(),
      totalExercises: exercises.length,
      exercises: exercises,
    };
    
    fs.writeFileSync(
      jsonOutputPath,
      JSON.stringify(output, null, 2),
      'utf-8'
    );
    
    console.log(`\n✅ Fichier JSON créé: ${jsonOutputPath}`);
    console.log(`📊 Total: ${exercises.length} exercices`);
    
    return exercises;
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

// Exécuter
main();
