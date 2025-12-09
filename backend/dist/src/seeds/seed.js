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
const bcrypt = __importStar(require("bcrypt"));
const prisma = new client_1.PrismaClient();
async function seedExercises() {
    console.log('📚 Starting exercises seed...');
    try {
        const exercisesPath = path.join(__dirname, 'exercises.json');
        const exercisesData = JSON.parse(fs.readFileSync(exercisesPath, 'utf-8'));
        console.log(`Found ${exercisesData.length} exercises to import`);
        const existingCount = await prisma.exercise.count();
        console.log(`Already have ${existingCount} exercises in database`);
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
                }
                catch (error) {
                    continue;
                }
            }
            console.log(`✅ Imported ${exercisesData.length} exercises`);
        }
        else {
            console.log('⏭️  Exercises already imported, skipping...');
        }
    }
    catch (error) {
        console.error('❌ Error seeding exercises:', error);
        throw error;
    }
}
async function seedUsers() {
    console.log('👥 Starting users seed...');
    try {
        const adminExists = await prisma.user.findUnique({
            where: { email: 'admin@gobeyondfit.com' },
        });
        if (!adminExists) {
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
        }
        else {
            console.log('⏭️  Admin user already exists, skipping...');
        }
        const coachByPseudoExists = await prisma.user.findUnique({
            where: { pseudo: 'coach' },
        }).catch(() => null);
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
        }
        else {
            console.log('⏭️  Coach user already exists, skipping...');
        }
    }
    catch (error) {
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
    }
    catch (error) {
        console.error('Seed failed:', error);
        process.exit(1);
    }
    finally {
        await prisma.$disconnect();
    }
}
main();
//# sourceMappingURL=seed.js.map