import { Test, TestingModule } from '@nestjs/testing';
import { MonitoringProcessor } from './monitoring.processor';
import { TripRepository } from '../repositories/trip.repository';
import { DeviationService } from '../services/deviation.service';
import { AnomalyService } from '../services/anomaly.service';
import { EscalationService } from '../services/escalation.service';
import { TripStatus } from '../entities/trip.entity';

describe('MonitoringProcessor', () => {
    let processor: MonitoringProcessor;
    let tripRepository: TripRepository;
    let deviationService: DeviationService;
    let anomalyService: AnomalyService;
    let escalationService: EscalationService;

    const mockTripRepository = {
        findById: jest.fn(),
        save: jest.fn(),
    };

    const mockDeviationService = {
        checkDeviation: jest.fn(),
    };

    const mockAnomalyService = {
        checkIsolation: jest.fn(),
        checkSignalLoss: jest.fn(),
    };

    const mockEscalationService = {
        escalateFlags: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                MonitoringProcessor,
                { provide: TripRepository, useValue: mockTripRepository },
                { provide: DeviationService, useValue: mockDeviationService },
                { provide: AnomalyService, useValue: mockAnomalyService },
                { provide: EscalationService, useValue: mockEscalationService },
            ],
        }).compile();

        processor = module.get<MonitoringProcessor>(MonitoringProcessor);
        tripRepository = module.get<TripRepository>(TripRepository);
        deviationService = module.get<DeviationService>(DeviationService);
        anomalyService = module.get<AnomalyService>(AnomalyService);
        escalationService = module.get<EscalationService>(EscalationService);
    });

    it('should be defined', () => {
        expect(processor).toBeDefined();
    });

    describe('process', () => {
        it('should skip processing if trip is not found or not active', async () => {
            mockTripRepository.findById.mockResolvedValue(null);
            await processor.process({ data: { tripId: 'trip-1' }, name: 'telemetry.process' } as any);
            expect(mockDeviationService.checkDeviation).not.toHaveBeenCalled();

            mockTripRepository.findById.mockResolvedValue({ status: TripStatus.COMPLETED });
            await processor.process({ data: { tripId: 'trip-1' }, name: 'telemetry.process' } as any);
            expect(mockDeviationService.checkDeviation).not.toHaveBeenCalled();
        });

        it('should run detection checks and update trip status if flags are raised', async () => {
            const trip = { id: 'trip-1', status: TripStatus.ACTIVE, baseline_risk: 1.0 };
            mockTripRepository.findById.mockResolvedValue(trip);
            mockDeviationService.checkDeviation.mockResolvedValue(true);
            mockAnomalyService.checkIsolation.mockResolvedValue(true);
            mockAnomalyService.checkSignalLoss.mockResolvedValue(false);

            await processor.process({ data: { tripId: 'trip-1' }, name: 'telemetry.process' } as any);

            expect(trip.status).toBe(TripStatus.ESCALATED);
            expect(mockEscalationService.escalateFlags).toHaveBeenCalledWith(trip);
            expect(mockTripRepository.save).toHaveBeenCalledWith(trip);
        });
    });
});
