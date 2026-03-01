import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import request from 'supertest';
import { TripController } from '../src/modules/trip-guard/controllers/trip.controller';
import { SosController } from '../src/modules/trip-guard/controllers/sos.controller';
import { TripService } from '../src/modules/trip-guard/services/trip.service';
import { TelemetryService } from '../src/modules/trip-guard/services/telemetry.service';
import { AnomalyService } from '../src/modules/trip-guard/services/anomaly.service';
import { DeviationService } from '../src/modules/trip-guard/services/deviation.service';
import { EscalationService } from '../src/modules/trip-guard/services/escalation.service';
import { EncryptionService } from '../src/modules/trip-guard/services/encryption.service';
import { TripRepository } from '../src/modules/trip-guard/repositories/trip.repository';
import { TelemetryRepository } from '../src/modules/trip-guard/repositories/telemetry.repository';
import { SOSRepository } from '../src/modules/trip-guard/repositories/sos.repository';
import { SegmentService } from '../src/modules/risk-engine/services/segment.service';
import { RiskService } from '../src/modules/risk-engine/services/risk.service';
import { FirebaseService } from '../src/infrastructure/firebase/firebase.service';
import { getQueueToken } from '@nestjs/bullmq';
import { FirebaseAuthGuard } from '../src/common/guards/firebase-auth.guard';
import { TripStatus } from '../src/modules/trip-guard/entities/trip.entity';
import { createHash } from 'crypto';

@Injectable()
class MockAuthGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const req = context.switchToHttp().getRequest();
        req.user = { uid: 'test-user-uid' };
        return true;
    }
}

describe('Trip Guard (Integration)', () => {
    let app: INestApplication;

    const TEST_UID = 'test-user-uid';
    const TEST_USER_HASH = createHash('sha256').update(TEST_UID).digest('hex');

    // Mock repositories
    const mockTripRepository = {
        findActiveByUserId: jest.fn().mockResolvedValue([]),
        create: jest.fn().mockImplementation((dto) => Promise.resolve({ id: 'trip-123', ...dto, baseline_risk: 3.5, status: TripStatus.ACTIVE })),
        findById: jest.fn().mockResolvedValue({ id: 'trip-123', user_id_hash: TEST_USER_HASH, status: TripStatus.ACTIVE }),
        save: jest.fn().mockImplementation((trip) => Promise.resolve(trip)),
    };

    const mockTelemetryRepository = {
        createBatch: jest.fn().mockResolvedValue(undefined),
    };

    const mockSosRepository = {
        create: jest.fn().mockResolvedValue({ id: 'sos-1' }),
    };

    const mockQueue = {
        add: jest.fn().mockResolvedValue({ id: 'job-1' }),
    };

    const mockFirebaseService = {};
    const mockSegmentService = {
        getRouteRisk: jest.fn().mockResolvedValue({ overallRisk: 3.5 }),
    };
    const mockRiskService = {};

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            controllers: [TripController, SosController],
            providers: [
                TripService,
                TelemetryService,
                AnomalyService,
                DeviationService,
                EscalationService,
                EncryptionService,
                { provide: TripRepository, useValue: mockTripRepository },
                { provide: TelemetryRepository, useValue: mockTelemetryRepository },
                { provide: SOSRepository, useValue: mockSosRepository },
                { provide: FirebaseService, useValue: mockFirebaseService },
                { provide: SegmentService, useValue: mockSegmentService },
                { provide: RiskService, useValue: mockRiskService },
                { provide: getQueueToken('trip-monitoring'), useValue: mockQueue },
                { provide: FirebaseAuthGuard, useClass: MockAuthGuard },
            ],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe());
        await app.init();
    }, 15000);

    afterAll(async () => {
        if (app) {
            await app.close();
        }
    });

    it('/trip/start (POST) - Success', async () => {
        const res = await request(app.getHttpServer())
            .post('/trip/start')
            .set('Authorization', 'Bearer mock-token')
            .send({
                city: 'Lagos',
                startLat: 6.5244,
                startLng: 3.3792,
                destLat: 6.4531,
                destLng: 3.483,
                expected_route: 'LINESTRING(3.3792 6.5244, 3.483 6.4531)',
            });

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('tripId');
    });

    it('/trip/telemetry (POST) - Success', async () => {
        const res = await request(app.getHttpServer())
            .post('/trip/telemetry')
            .set('Authorization', 'Bearer mock-token')
            .send({
                tripId: 'trip-123',
                points: [
                    {
                        lat: 6.5245,
                        lng: 3.3793,
                        speed: 5.5,
                        heading: 45,
                        networkState: 'online',
                        timestamp: new Date().toISOString(),
                    },
                ],
            });

        expect(res.status).toBe(201);
        expect(res.body.ack).toBe(true);
    });

    it('/sos/trigger (POST) - Success', async () => {
        const res = await request(app.getHttpServer())
            .post('/sos/trigger')
            .set('Authorization', 'Bearer mock-token')
            .send({
                tripId: 'trip-123',
                encryptedPayload: Buffer.from('help').toString('base64'),
            });

        expect(res.status).toBe(201);
    });

    it('/trip/end (POST) - Success', async () => {
        const res = await request(app.getHttpServer())
            .post('/trip/end')
            .set('Authorization', 'Bearer mock-token')
            .send({
                tripId: 'trip-123',
            });

        expect(res.status).toBe(201);
    });
});
