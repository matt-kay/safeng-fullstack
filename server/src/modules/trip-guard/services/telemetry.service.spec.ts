import { Test, TestingModule } from '@nestjs/testing';
import { TelemetryService } from './telemetry.service';
import { TelemetryRepository } from '../repositories/telemetry.repository';
import { getQueueToken } from '@nestjs/bullmq';
import { Trip } from '../entities/trip.entity';

describe('TelemetryService', () => {
    let service: TelemetryService;
    let telemetryRepository: TelemetryRepository;
    let monitoringQueue: any;

    const mockTelemetryRepository = {
        createBatch: jest.fn(),
    };

    const mockQueue = {
        add: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TelemetryService,
                { provide: TelemetryRepository, useValue: mockTelemetryRepository },
                { provide: getQueueToken('trip-monitoring'), useValue: mockQueue },
            ],
        }).compile();

        service = module.get<TelemetryService>(TelemetryService);
        telemetryRepository = module.get<TelemetryRepository>(TelemetryRepository);
        monitoringQueue = module.get(getQueueToken('trip-monitoring'));
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('handleBatch', () => {
        it('should save telemetry and queue a processing job', async () => {
            const trip = { id: 'trip-1', city: 'Lagos' } as Trip;
            const points = [
                { lat: 6.5244, lng: 3.3792, speed: 10, heading: 90, networkState: 'online', timestamp: new Date().toISOString() },
            ];

            await service.handleBatch(trip, points);

            expect(telemetryRepository.createBatch).toHaveBeenCalled();
            expect(monitoringQueue.add).toHaveBeenCalledWith(
                'telemetry.process',
                expect.objectContaining({ tripId: 'trip-1', city: 'Lagos' }),
                expect.any(Object),
            );
        });
    });
});
