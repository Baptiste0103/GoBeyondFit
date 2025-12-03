const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function importExercises() {
  try {
    // Read the exercises JSON file
    const exercisesPath = path.join(__dirname, 'exercises.json');
    const data = fs.readFileSync(exercisesPath, 'utf8');
    const exercises = JSON.parse(data);

    console.log(`Starting import of ${exercises.length} exercises...`);

    let imported = 0;
    let skipped = 0;

    // Process exercises in batches
    const batchSize = 100;
    for (let i = 0; i < exercises.length; i += batchSize) {
      const batch = exercises.slice(i, i + batchSize);
      
      for (const ex of batch) {
        try {
          // Check if exercise already exists
          const existing = await prisma.exercise.findFirst({
            where: {
              name: ex.exercise?.trim(),
            },
          });

          if (existing) {
            skipped++;
            continue;
          }

          // Create the exercise with only the required fields from the dataset
          await prisma.exercise.create({
            data: {
              name: ex.exercise?.trim() || 'Untitled',
              type: 'standard', // Default type
              scope: 'global', // All imported exercises are global
              description: ex.short_youtube_demonstration || null,
              meta: {
                difficulty_level: ex.difficulty_level || null,
                target_muscle_group: ex.target_muscle_group || null,
                explanation_link: ex.indepth_explanation_link || null,
                in_depth_youtube_explanation: ex['in-depth_youtube_explanation'] || null,
              },
            },
          });
          imported++;

          if ((imported + skipped) % 100 === 0) {
            console.log(`Progress: ${imported + skipped}/${exercises.length} processed (${imported} imported, ${skipped} skipped)`);
          }
        } catch (error) {
          console.error(`Error importing exercise "${ex.exercise}":`, error.message);
          skipped++;
        }
      }
    }

    console.log(`\nImport complete!`);
    console.log(`Total exercises imported: ${imported}`);
    console.log(`Total exercises skipped: ${skipped}`);

    // Verify the import
    const count = await prisma.exercise.count();
    console.log(`Total exercises in database: ${count}`);

  } catch (error) {
    console.error('Fatal error during import:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

importExercises();
