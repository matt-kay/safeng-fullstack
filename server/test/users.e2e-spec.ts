import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

// Use Emulators
process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';
process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
// process.env.GOOGLE_APPLICATION_CREDENTIALS = '...'; // might be needed natively or dummy project id
process.env.GCLOUD_PROJECT = 'demo-test';

describe('Users API (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Authentication and Authorization', () => {
    it('/api/v1/me (GET) - Should return 401 if unauthorized', () => {
      return request(app.getHttpServer()).get('/api/v1/me').expect(401);
    });

    // To test 200/403 we would need a valid emulator ID token.
    // Creating a token via REST API to the auth emulator might be tricky in pure e2e,
    // so we document that integration test involves emulator token creation.
  });
});
