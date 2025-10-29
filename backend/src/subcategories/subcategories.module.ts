import { Module } from '@nestjs/common';
import { SubCategoriesController } from './subcategories.controller';
import { SubCategoriesService } from './subcategories.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SubCategoriesController],
  providers: [SubCategoriesService],
  exports: [SubCategoriesService],
})
export class SubCategoriesModule {}
