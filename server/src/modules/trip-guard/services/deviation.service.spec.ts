import { Test, TestingModule } from '@nestjs/testing';
import { DeviationService } from './deviation.service';
import { TelemetryRepository } from '../repositories/telemetry.repository';
import { Trip } from '../entities/trip.entity';

describe('DeviationService', () => {
    let service: DeviationService;
    let telemetryRepository: TelemetryRepository;

    const mockTelemetryRepository = {
        getDistanceToExpectedRoute: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DeviationService,
                {
                    provide: TelemetryRepository,
                    useValue: mockTelemetryRepository,
                },
            ],
        }).compile();

        service = module.get<DeviationService>(DeviationService);
        telemetryRepository = module.get<TelemetryRepository>(TelemetryRepository);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('checkDeviation', () => {
        it('should return true if distance is greater than 300m', async () => {
            const trip = { id: 'trip-1', expected_route: 'LINESTRING(...)' } as Trip;
            mockTelemetryRepository.getDistanceToExpectedRoute.mockResolvedValue(301);

            const result = await service.checkDeviation(trip);

            expect(result).toBe(true);
            expect(telemetryRepository.getDistanceToExpectedRoute).toHaveBeenCalledWith(
                trip.id,
                trip.expected_route,
            );
        });

        it('should return false if distance is 300m or less', async () => {
            const trip = { id: 'trip-1', expected_route: 'LINESTRING(...)' } as Trip;
            mockTelemetryRepository.getDistanceToExpectedRoute.mockResolvedValue(300);

            const result = await service.checkDeviation(trip);

            expect(result).toBe(false);
        });

        it('should return false if distance calculation fails or returns 0', async () => {
            const trip = { id: 'trip-1', expected_route: 'LINESTRING(...)' } as Trip;
            mockTelemetryRepository.getDistanceToExpectedRoute.mockResolvedValue(0);

            const result = await service.checkDeviation(trip);

            expect(result).toBe(false);
        });
    });
});
