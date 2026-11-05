import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserMapping } from './entities/user-mapping.entity';
import { MappingCacheService } from './mapping-cache.service';
import { MappingController } from './mapping.controller';
import { MappingService } from './mapping.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserMapping])],
  controllers: [MappingController],
  providers: [MappingService, MappingCacheService],
})
export class MappingModule {}
