import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MappingModule } from './mapping/mapping.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql' as const,
        host: config.getOrThrow<string>('MYSQL_HOST'),
        port: Number(config.get<string>('MYSQL_PORT', '3306')),
        username: config.getOrThrow<string>('MYSQL_USER'),
        password: config.getOrThrow<string>('MYSQL_PASSWORD'),
        database: config.getOrThrow<string>('MYSQL_DATABASE'),
        autoLoadEntities: true,
        synchronize: config.get<string>('DB_SYNCHRONIZE', 'false') === 'true',
        charset: 'utf8mb4',
      }),
    }),
    MappingModule,
  ],
})
export class AppModule {}
