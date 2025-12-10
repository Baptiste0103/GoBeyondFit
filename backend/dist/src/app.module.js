"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const exercise_module_1 = require("./exercises/exercise.module");
const group_module_1 = require("./groups/group.module");
const program_module_1 = require("./programs/program.module");
const session_module_1 = require("./sessions/session.module");
const session_progress_module_1 = require("./session-progress/session-progress.module");
const workout_module_1 = require("./workouts/workout.module");
const common_module_1 = require("./common/common.module");
const invitation_module_1 = require("./invitations/invitation.module");
const ratings_module_1 = require("./ratings/ratings.module");
const favorites_module_1 = require("./favorites/favorites.module");
const history_module_1 = require("./history/history.module");
const badge_module_1 = require("./badges/badge.module");
const stats_module_1 = require("./stats/stats.module");
const storage_module_1 = require("./storage/storage.module");
const notifications_module_1 = require("./notifications/notifications.module");
const export_module_1 = require("./export/export.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: ['.env.local', '.env'],
                expandVariables: true,
            }),
            prisma_module_1.PrismaModule,
            common_module_1.CommonModule,
            users_module_1.UsersModule,
            auth_module_1.AuthModule,
            exercise_module_1.ExerciseModule,
            ratings_module_1.RatingsModule,
            favorites_module_1.FavoritesModule,
            history_module_1.HistoryModule,
            group_module_1.GroupModule,
            program_module_1.ProgramModule,
            session_module_1.SessionModule,
            session_progress_module_1.SessionProgressModule,
            workout_module_1.WorkoutModule,
            badge_module_1.BadgeModule,
            stats_module_1.StatsModule,
            invitation_module_1.InvitationModule,
            storage_module_1.StorageModule,
            notifications_module_1.NotificationsModule,
            export_module_1.ExportModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map