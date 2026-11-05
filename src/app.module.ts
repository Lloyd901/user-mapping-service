import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { validateEnvironment } from './config.validation';
import { MappingModule } from './mapping/mapping.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnvironment,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql' as const,
        host: config.get<string>('MYSQL_HOST', 'localhost'),
        port: Number(config.get<string>('MYSQL_PORT', '3306')),
        username: config.get<string>('MYSQL_USER', 'app'),
        password: config.getOrThrow<string>('MYSQL_PASSWORD'),
        database: config.get<string>('MYSQL_DATABASE', 'user_mapping'),
        autoLoadEntities: true,
        synchronize: config.get<string>('DB_SYNCHRONIZE', 'false') === 'true',
        charset: 'utf8mb4',
      }),
    }),
    MappingModule,
  ],
})
export class AppModule {}
