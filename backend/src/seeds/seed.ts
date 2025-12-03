import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

interface ExerciseData {
  exercise: string;
  short_youtube_demonstration?: string;
  'in-depth_youtube_explanation'?: string;
  difficulty_level?: string;
  target_muscle_group?: string;
  indepth_explanation_link?: string;
}

async function seedExercises() {
  console.log('📚 Starting exercises seed...');
  
  try {
    // Read exercises JSON
    const exercisesPath = path.join(__dirname, 'exercises.json');
    const exercisesData: ExerciseData[] = JSON.parse(
      fs.readFileSync(exercisesPath, 'utf-8'),
    );

    console.log(`Found ${exercisesData.length} exercises to import`);

    // Check how many already exist
    const existingCount = await prisma.exercise.count();
    console.log(`Already have ${existingCount} exercises in database`);

    // Import exercises if not already present
    if (existingCount === 0) {
      for (const exerciseData of exercisesData) {
        try {
          await prisma.exercise.create({
            data: {
              name: exerciseData.exercise,
              description: exerciseData['in-depth_youtube_explanation'] || '',
              type: 'custom',
              scope: 'global',
              meta: {
                difficulty: exerciseData.difficulty_level || 'Beginner',
                targetMuscle: exerciseData.target_muscle_group || 'General',
                youtubeLink: exerciseData.indepth_explanation_link || '',
                demoLink: exerciseData.short_youtube_demonstration || '',
              },
            },
          });
        } catch (error) {
          // Skip duplicates
          continue;
        }
      }
      console.log(`✅ Imported ${exercisesData.length} exercises`);
    } else {
      console.log('⏭️  Exercises already imported, skipping...');
    }
  } catch (error) {
    console.error('❌ Error seeding exercises:', error);
    throw error;
  }
}

async function seedUsers() {
  console.log('👥 Starting users seed...');

  try {
    // Check if admin exists
    const adminExists = await prisma.user.findUnique({
      where: { email: 'admin@gobeyondfit.com' },
    });

    if (!adminExists) {
      // Hash password for admin
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await prisma.user.create({
        data: {
          email: 'admin@gobeyondfit.com',
          pseudo: 'admin',
          firstName: 'Admin',
          lastName: 'User',
          password: hashedPassword,
          role: 'admin',
        },
      });
      
      console.log('✅ Admin user created');
    } else {
      console.log('⏭️  Admin user already exists, skipping...');
    }

    // Check if coach exists by pseudo first
    const coachByPseudoExists = await prisma.user.findUnique({
      where: { pseudo: 'coach' },
    }).catch(() => null);

    // Check if coach exists by email
    const coachExists = await prisma.user.findUnique({
      where: { email: 'coach@gobeyondfit.com' },
    }).catch(() => null);

    if (!coachExists && !coachByPseudoExists) {
      const hashedPassword = await bcrypt.hash('coach123', 10);
      
      await prisma.user.create({
        data: {
          email: 'coach@gobeyondfit.com',
          pseudo: 'coach',
          firstName: 'Coach',
          lastName: 'User',
          password: hashedPassword,
          role: 'coach',
        },
      });
      
      console.log('✅ Coach user created');
    } else {
      console.log('⏭️  Coach user already exists, skipping...');
    }
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    throw error;
  }
}

async function main() {
  try {
    console.log('🌱 Starting database seed...\n');
    
    await seedUsers();
    console.log('');
    await seedExercises();
    
    console.log('\n✨ Seed completed successfully!');
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
