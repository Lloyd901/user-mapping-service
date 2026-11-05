import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class MappingCacheService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MappingCacheService.name);
  private readonly redis: Redis;
  private readonly ttlSeconds: number;

  constructor(private readonly config: ConfigService) {
    this.ttlSeconds = Number(config.get<string>('REDIS_TTL_SECONDS', '3600'));
    this.redis = new Redis({
      host: config.get<string>('REDIS_HOST', 'localhost'),
      port: Number(config.get<string>('REDIS_PORT', '6379')),
      password: config.get<string>('REDIS_PASSWORD') || undefined,
      lazyConnect: true,
      enableOfflineQueue: false,
      maxRetriesPerRequest: 1,
    });
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.redis.connect();
    } catch (error) {
      this.logger.warn(`Redis unavailable; continuing with MySQL only: ${this.errorMessage(error)}`);
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.redis.status === 'ready' || this.redis.status === 'connecting') {
      await this.redis.quit();
    }
  }

  async get(id1: string, id2: string): Promise<string | null> {
    try {
      return await this.redis.get(this.key(id1, id2));
    } catch (error) {
      this.logger.warn(`Redis read failed: ${this.errorMessage(error)}`);
      return null;
    }
  }

  async set(id1: string, id2: string, userID: string): Promise<void> {
    try {
      await this.redis.set(this.key(id1, id2), userID, 'EX', this.ttlSeconds);
    } catch (error) {
      this.logger.warn(`Redis write failed: ${this.errorMessage(error)}`);
    }
  }

  private key(id1: string, id2: string): string {
    return `user-mapping:${encodeURIComponent(id1)}:${encodeURIComponent(id2)}`;
  }

  private errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'unknown error';
  }
}
