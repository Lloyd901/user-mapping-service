import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'node:crypto';
import { QueryFailedError, Repository } from 'typeorm';
import { CreateMappingDto } from './dto/create-mapping.dto';
import { UserMapping } from './entities/user-mapping.entity';
import { MappingCacheService } from './mapping-cache.service';

export interface UserIDResponse {
  userID: string;
}

@Injectable()
export class MappingService {
  private readonly logger = new Logger(MappingService.name);

  constructor(
    @InjectRepository(UserMapping)
    private readonly repository: Repository<UserMapping>,
    private readonly cache: MappingCacheService,
  ) {}

  async resolve(dto: CreateMappingDto): Promise<UserIDResponse> {
    const cached = await this.getCached(dto.id1, dto.id2);
    if (cached) {
      return { userID: cached };
    }

    try {
      const existing = await this.repository.findOne({
        where: { id1: dto.id1, id2: dto.id2 },
      });
      if (existing) {
        await this.setCached(dto.id1, dto.id2, existing.userID);
        return { userID: existing.userID };
      }

      const userID = randomUUID();
      const created = await this.repository.save(
        this.repository.create({ id1: dto.id1, id2: dto.id2, userID }),
      );
      await this.setCached(dto.id1, dto.id2, created.userID);
      return { userID: created.userID };
    } catch (error) {
      if (this.isDuplicateKeyError(error)) {
        try {
          const winner = await this.repository.findOne({
            where: { id1: dto.id1, id2: dto.id2 },
          });
          if (winner) {
            await this.setCached(dto.id1, dto.id2, winner.userID);
            return { userID: winner.userID };
          }
        } catch (lookupError) {
          this.logger.error(
            'Failed to read mapping after duplicate insert',
            lookupError instanceof Error ? lookupError.stack : undefined,
          );
          throw new InternalServerErrorException(
            'Unable to process the mapping request.',
          );
        }
        throw new ConflictException('The mapping was created concurrently; please retry.');
      }

      this.logger.error(
        'Failed to process user mapping',
        error instanceof Error ? error.stack : undefined,
      );
      throw new InternalServerErrorException('Unable to process the mapping request.');
    }
  }

  private async getCached(id1: string, id2: string): Promise<string | null> {
    try {
      return await this.cache.get(id1, id2);
    } catch (error) {
      this.logger.warn(
        'Cache read failed; continuing with the database',
        error instanceof Error ? error.message : undefined,
      );
      return null;
    }
  }

  private async setCached(id1: string, id2: string, userID: string): Promise<void> {
    try {
      await this.cache.set(id1, id2, userID);
    } catch (error) {
      this.logger.warn(
        'Cache write failed; continuing without cache',
        error instanceof Error ? error.message : undefined,
      );
    }
  }

  private isDuplicateKeyError(error: unknown): boolean {
    if (!(error instanceof QueryFailedError)) {
      return false;
    }
    const driverError = error.driverError as { code?: string };
    return driverError.code === 'ER_DUP_ENTRY';
  }
}
