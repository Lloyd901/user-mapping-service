import { ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { MappingController } from '../src/mapping/mapping.controller';
import { MappingService } from '../src/mapping/mapping.service';

describe('MappingController validation', () => {
  let app: NestExpressApplication;
  const service = { resolve: jest.fn().mockResolvedValue({ userID: 'user-id' }) };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [MappingController],
      providers: [{ provide: MappingService, useValue: service }],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it.each([
    [{ id2: 'XYZ456' }, 'missing id1'],
    [{ id1: 'ABC123' }, 'missing id2'],
    [{ id1: '', id2: 'XYZ456' }, 'empty id1'],
    [{ id1: '   ', id2: 'XYZ456' }, 'blank id1'],
    [{ id1: 123, id2: 'XYZ456' }, 'non-string id1'],
    [{ id1: 'ABC123', id2: 'XYZ456', extra: true }, 'unknown field'],
  ])('rejects %s', async (body: Record<string, unknown>, description: string) => {
    expect(description).toBeDefined();
    await request(app.getHttpServer()).post('/user-mappings').send(body).expect(400);
    expect(service.resolve).not.toHaveBeenCalled();
  });
});
