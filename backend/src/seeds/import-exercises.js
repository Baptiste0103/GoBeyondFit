#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function seedExercises() {
  try {
    console.log('🌱 Starting exercises import...\n');

    const jsonPath = path.join(__dirname, 'exercises.json');

    if (!fs.existsSync(jsonPath)) {
      throw new Error(`File not found: ${jsonPath}`);
    }

    const exercises = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

    console.log(`📊 ${exercises.length} exercises to insert`);

    // Check if exercises already exist
    const existingCount = await prisma.exercise.count({
      where: { scope: 'global' },
    });

    if (existingCount > 0) {
      console.log(`⚠️  ${existingCount} global exercises already exist`);
      console.log('✓ Skipping seed...\n');
      await prisma.$disconnect();
      return;
    }

    let inserted = 0;
    let failed = 0;

    for (const exercise of exercises) {
      try {
        await prisma.exercise.create({
          data: {
            name: exercise.exercise || 'Unknown',
            type: 'standard',
            description: exercise.target_muscle_group || 'Full Body',
            meta: {
              difficulty_level: exercise.difficulty_level || 'BEGINNER',
              target_muscle_group: exercise.target_muscle_group || 'Full Body',
              indepth_explanation_link: exercise.indepth_explanation_link || '',
            },
            scope: 'global',
          },
        });
        inserted++;
        if (inserted % 500 === 0) {
          console.log(`✓ ${inserted} exercises inserted...`);
        }
      } catch (err) {
        failed++;
        if (failed <= 5) {
          console.error(`✗ Error inserting exercise "${exercise.exercise}":`, err.message);
        }
      }
    }

    console.log(`\n✅ Seed completed!`);
    console.log(`   ✓ ${inserted} inserted`);
    if (failed > 0) console.log(`   ✗ ${failed} failed`);

    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Seed failed:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

seedExercises();
