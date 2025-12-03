const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

interface ExerciseData {
  exercise: string;
  short_youtube_demonstration?: string;
  in_depth_youtube_explanation?: string;
  short_demonstration_link?: string;
  indepth_explanation_link?: string;
  difficulty_level?: string;
  target_muscle_group?: string;
}

/**
 * Seed les exercices depuis le fichier JSON
 */
async function main() {
  try {
    console.log('🌱 Démarrage du seeding des exercices...\n');

    // Lire le fichier JSON
    const jsonPath = path.join(
      __dirname,
      '../src/seeds/exercises.json'
    );

    if (!fs.existsSync(jsonPath)) {
      throw new Error(`Fichier non trouvé: ${jsonPath}`);
    }

    const exercises: ExerciseData[] = JSON.parse(
      fs.readFileSync(jsonPath, 'utf-8')
    );

    console.log(`📊 ${exercises.length} exercices à insérer`);
    console.log('Version DB: 2.9');
    console.log(`Dernière mise à jour: ${new Date().toISOString()}\n`);

    // Vérifier si les exercices existent déjà (globaux)
    const existingCount = await prisma.exercise.count({
      where: { scope: 'global' },
    });

    if (existingCount > 0) {
      console.log(`⚠️  ${existingCount} exercices globaux existent déjà`);
      console.log('✓ Skipping seed...\n');
      return;
    }

    // Insérer les exercices
    let successCount = 0;
    let errorCount = 0;

    for (const exerciseData of exercises) {
      try {
        // Mapper les données JSON aux champs Prisma
        const exercise = await prisma.exercise.create({
          data: {
            name: exerciseData.exercise,
            description: buildDescription(exerciseData),
            type: 'standard', // All exercises are standard type
            scope: 'global', // Les exercices sont globaux (partagés)
            meta: {
              exercise: exerciseData.exercise,
              shortDemonstration: exerciseData.short_youtube_demonstration,
              inDepthExplanation: exerciseData.in_depth_youtube_explanation,
              shortDemonstrationLink: exerciseData.short_demonstration_link || null,
              inDepthExplanationLink: exerciseData.indepth_explanation_link || null,
              difficultyLevel: exerciseData.difficulty_level,
              targetMuscleGroup: exerciseData.target_muscle_group,
            },
          },
        });

        successCount++;

        if (successCount % 100 === 0) {
          console.log(`✅ ${successCount} exercices insérés...`);
        }
      } catch (error: any) {
        errorCount++;
        if (errorCount <= 5) {
          // Afficher les 5 premiers erreurs
          console.error(`❌ Erreur pour "${exerciseData.exercise}":`, error.message);
        }
      }
    }

    console.log(`\n✅ ${successCount} exercices insérés avec succès`);
    if (errorCount > 0) {
      console.log(`⚠️  ${errorCount} erreurs lors du seeding`);
    }

    // Afficher les stats
    const totalExercises = await prisma.exercise.count();
    console.log(`\n📊 Total exercices en DB: ${totalExercises}`);

    // Grouper par muscle
    const byMuscle = await prisma.exercise.groupBy({
      by: ['type'],
      _count: { id: true },
      where: { scope: 'global' },
    });

    console.log('\n💪 Exercices par type:');
    for (const group of byMuscle) {
      console.log(`  - ${group.type}: ${group._count.id}`);
    }
  } catch (error) {
    console.error('❌ Erreur lors du seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Construire la description à partir des métadonnées
 */
function buildDescription(exercise: ExerciseData): string {
  const parts: string[] = [];

  if (exercise.target_muscle_group) {
    parts.push(`Target: ${exercise.target_muscle_group}`);
  }
  if (exercise.difficulty_level) {
    parts.push(`Difficulty: ${exercise.difficulty_level}`);
  }

  return parts.join(' | ') || 'No description available';
}

main();
