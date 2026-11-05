import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { randomUUID } from 'node:crypto';

const describeIntegration =
  process.env.RUN_INTEGRATION_TESTS === 'true' ? describe : describe.skip;

describeIntegration('User mapping API (integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const { AppModule } = await import('../src/app.module');
    const module = await Test.createTestingModule({
      imports: [AppModule],
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
    await app?.close();
  });

  it('returns the same userID for repeated and concurrent requests', async () => {
    const id1 = `integration-${randomUUID()}`;
    const id2 = `pair-${randomUUID()}`;
    const body = { id1, id2 };

    const first = await request(app.getHttpServer())
      .post('/user-mappings')
      .send(body)
      .expect(201);
    expect(first.body.userID).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );

    const responses = await Promise.all(
      Array.from({ length: 3 }, () =>
        request(app.getHttpServer()).post('/user-mappings').send(body).expect(201),
      ),
    );

    expect(new Set(responses.map(({ body: response }) => response.userID))).toEqual(
      new Set([first.body.userID]),
    );
  });
});
