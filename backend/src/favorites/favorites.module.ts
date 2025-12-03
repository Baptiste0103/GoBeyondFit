import { Module } from '@nestjs/common'
import { PrismaModule } from '../prisma/prisma.module'
import { FavoritesController, UserFavoritesController } from './favorites.controller'
import { FavoritesService } from './favorites.service'

@Module({
  imports: [PrismaModule],
  controllers: [FavoritesController, UserFavoritesController],
  providers: [FavoritesService],
  exports: [FavoritesService],
})
export class FavoritesModule {}
