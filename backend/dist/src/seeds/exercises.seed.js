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
const client_1 = require("@prisma/client");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const prisma = new client_1.PrismaClient();
async function seedExercises() {
    try {
        console.log('🌱 Démarrage du seeding des exercices...\n');
        const jsonPath = path.join(__dirname, 'exercises.json');
        if (!fs.existsSync(jsonPath)) {
            throw new Error(`Fichier non trouvé: ${jsonPath}`);
        }
        const exercises = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
        console.log(`📊 ${exercises.length} exercices à insérer`);
        console.log('Version DB: 2.9');
        console.log(`Dernière mise à jour: ${new Date().toISOString()}\n`);
        const existingCount = await prisma.exercise.count({
            where: { scope: 'global' },
        });
        if (existingCount > 0) {
            console.log(`⚠️  ${existingCount} exercices globaux existent déjà`);
            console.log('✓ Skipping seed...\n');
            return;
        }
        let successCount = 0;
        let errorCount = 0;
        for (const exerciseData of exercises) {
            try {
                const exercise = await prisma.exercise.create({
                    data: {
                        name: exerciseData.exercise,
                        description: buildDescription(exerciseData),
                        type: mapDifficulty(exerciseData.difficulty_level),
                        scope: 'global',
                        meta: {
                            exercise: exerciseData.exercise,
                            shortDemonstration: exerciseData.short_youtube_demonstration,
                            inDepthExplanation: exerciseData['in-depth_youtube_explanation'],
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
            }
            catch (error) {
                errorCount++;
                if (errorCount <= 5) {
                    console.error(`❌ Erreur pour "${exerciseData.exercise}":`, error.message);
                }
            }
        }
        console.log(`\n✅ ${successCount} exercices insérés avec succès`);
        if (errorCount > 0) {
            console.log(`⚠️  ${errorCount} erreurs lors du seeding`);
        }
        const totalExercises = await prisma.exercise.count();
        console.log(`\n📊 Total exercices en DB: ${totalExercises}`);
        const byMuscle = await prisma.exercise.groupBy({
            by: ['type'],
            _count: { id: true },
            where: { scope: 'global' },
        });
        console.log('\n💪 Exercices par type:');
        for (const group of byMuscle) {
            console.log(`  - ${group.type}: ${group._count.id}`);
        }
    }
    catch (error) {
        console.error('❌ Erreur lors du seeding:', error);
        throw error;
    }
    finally {
        await prisma.$disconnect();
    }
}
function buildDescription(exercise) {
    const parts = [];
    if (exercise.target_muscle_group) {
        parts.push(`Target: ${exercise.target_muscle_group}`);
    }
    if (exercise.difficulty_level) {
        parts.push(`Difficulty: ${exercise.difficulty_level}`);
    }
    return parts.join(' | ') || 'No description available';
}
function mapDifficulty(difficulty) {
    return 'standard';
}
seedExercises().catch(error => {
    console.error(error);
    process.exit(1);
});
//# sourceMappingURL=exercises.seed.js.map