import { Test, TestingModule } from '@nestjs/testing';
import { AnomalyService } from './anomaly.service';
import { TelemetryRepository } from '../repositories/telemetry.repository';
import { RiskService } from '../../risk-engine/services/risk.service';
import { Trip } from '../entities/trip.entity';

describe('AnomalyService', () => {
    let service: AnomalyService;
    let telemetryRepository: TelemetryRepository;
    let riskService: RiskService;

    const mockTelemetryRepository = {
        getLatestForTrip: jest.fn(),
    };

    const mockRiskService = {
        getSpecificPointRisk: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AnomalyService,
                {
                    provide: TelemetryRepository,
                    useValue: mockTelemetryRepository,
                },
                {
                    provide: RiskService,
                    useValue: mockRiskService,
                },
            ],
        }).compile();

        service = module.get<AnomalyService>(AnomalyService);
        telemetryRepository = module.get<TelemetryRepository>(TelemetryRepository);
        riskService = module.get<RiskService>(RiskService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('checkIsolation', () => {
        it('should return true if speed is low and risk is high', async () => {
            const trip = { id: 'trip-1', city: 'Lagos' } as Trip;
            const latestTelemetry = {
                location: { coordinates: [3.3792, 6.5244] },
                speed_mps: 0.5,
            };
            mockTelemetryRepository.getLatestForTrip.mockResolvedValue(latestTelemetry);
            mockRiskService.getSpecificPointRisk.mockResolvedValue({ riskLevel: 'high' });

            const result = await service.checkIsolation(trip);

            expect(result).toBe(true);
        });

        it('should return false if speed is high', async () => {
            const trip = { id: 'trip-1', city: 'Lagos' } as Trip;
            const latestTelemetry = {
                location: { coordinates: [3.3792, 6.5244] },
                speed_mps: 5.0,
            };
            mockTelemetryRepository.getLatestForTrip.mockResolvedValue(latestTelemetry);

            const result = await service.checkIsolation(trip);

            expect(result).toBe(false);
        });

        it('should return false if risk is low', async () => {
            const trip = { id: 'trip-1', city: 'Lagos' } as Trip;
            const latestTelemetry = {
                location: { coordinates: [3.3792, 6.5244] },
                speed_mps: 0.5,
            };
            mockTelemetryRepository.getLatestForTrip.mockResolvedValue(latestTelemetry);
            mockRiskService.getSpecificPointRisk.mockResolvedValue({ riskLevel: 'low' });

            const result = await service.checkIsolation(trip);

            expect(result).toBe(false);
        });
    });

    describe('checkSignalLoss', () => {
        it('should return true if no telemetry found', async () => {
            const trip = { id: 'trip-1' } as Trip;
            mockTelemetryRepository.getLatestForTrip.mockResolvedValue(null);

            const result = await service.checkSignalLoss(trip);

            expect(result).toBe(true);
        });

        it('should return true if telemetry is older than 5 minutes', async () => {
            const trip = { id: 'trip-1' } as Trip;
            const oldDate = new Date();
            oldDate.setMinutes(oldDate.getMinutes() - 6);
            const latestTelemetry = { recorded_at: oldDate, network_state: 'online' };
            mockTelemetryRepository.getLatestForTrip.mockResolvedValue(latestTelemetry);

            const result = await service.checkSignalLoss(trip);

            expect(result).toBe(true);
        });

        it('should return true if network is offline and telemetry is older than 2 minutes', async () => {
            const trip = { id: 'trip-1' } as Trip;
            const oldDate = new Date();
            oldDate.setMinutes(oldDate.getMinutes() - 3);
            const latestTelemetry = { recorded_at: oldDate, network_state: 'offline' };
            mockTelemetryRepository.getLatestForTrip.mockResolvedValue(latestTelemetry);

            const result = await service.checkSignalLoss(trip);

            expect(result).toBe(true);
        });

        it('should return false if telemetry is recent and online', async () => {
            const trip = { id: 'trip-1' } as Trip;
            const latestTelemetry = { recorded_at: new Date(), network_state: 'online' };
            mockTelemetryRepository.getLatestForTrip.mockResolvedValue(latestTelemetry);

            const result = await service.checkSignalLoss(trip);

            expect(result).toBe(false);
        });
    });
});
