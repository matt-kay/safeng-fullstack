import { Test, TestingModule } from '@nestjs/testing';
import { TripService } from './trip.service';
import { TripRepository } from '../repositories/trip.repository';
import { TelemetryService } from './telemetry.service';
import { SOSRepository } from '../repositories/sos.repository';
import { EncryptionService } from './encryption.service';
import { EscalationService } from './escalation.service';
import { SegmentService } from '../../risk-engine/services/segment.service';
import { TripStatus } from '../entities/trip.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('TripService', () => {
    let service: TripService;
    let tripRepository: TripRepository;
    let segmentService: SegmentService;
    let telemetryService: TelemetryService;
    let sosRepository: SOSRepository;
    let escalationService: EscalationService;

    const mockTripRepository = {
        findActiveByUserId: jest.fn(),
        create: jest.fn(),
        findById: jest.fn(),
        save: jest.fn(),
    };

    const mockSegmentService = {
        getRouteRisk: jest.fn(),
    };

    const mockTelemetryService = {
        handleBatch: jest.fn(),
    };

    const mockSosRepository = {
        create: jest.fn(),
    };

    const mockEncryptionService = {
        encrypt: jest.fn(),
    };

    const mockEscalationService = {
        escalateSos: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TripService,
                { provide: TripRepository, useValue: mockTripRepository },
                { provide: SegmentService, useValue: mockSegmentService },
                { provide: TelemetryService, useValue: mockTelemetryService },
                { provide: SOSRepository, useValue: mockSosRepository },
                { provide: EncryptionService, useValue: mockEncryptionService },
                { provide: EscalationService, useValue: mockEscalationService },
            ],
        }).compile();

        service = module.get<TripService>(TripService);
        tripRepository = module.get<TripRepository>(TripRepository);
        segmentService = module.get<SegmentService>(SegmentService);
        telemetryService = module.get<TelemetryService>(TelemetryService);
        sosRepository = module.get<SOSRepository>(SOSRepository);
        escalationService = module.get<EscalationService>(EscalationService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('startTrip', () => {
        it('should throw BadRequestException if user has an active trip', async () => {
            mockTripRepository.findActiveByUserId.mockResolvedValue([{ id: 'active-trip' }]);
            await expect(service.startTrip('user-1', {} as any)).rejects.toThrow(BadRequestException);
        });

        it('should create a new trip and return trip details', async () => {
            mockTripRepository.findActiveByUserId.mockResolvedValue([]);
            mockSegmentService.getRouteRisk.mockResolvedValue({ overallRisk: 3.5 });
            mockTripRepository.create.mockResolvedValue({
                id: 'new-trip',
                baseline_risk: 3.5,
                status: TripStatus.ACTIVE,
            });

            const result = await service.startTrip('user-1', {
                city: 'Lagos',
                startLat: 6.5244,
                startLng: 3.3792,
                destLat: 6.4531,
                destLng: 3.483,
            } as any);

            expect(result.tripId).toBe('new-trip');
            expect(result.baselineRisk).toBe(3.5);
            expect(tripRepository.create).toHaveBeenCalled();
        });
    });

    describe('processTelemetry', () => {
        it('should throw NotFoundException if trip does not exist', async () => {
            mockTripRepository.findById.mockResolvedValue(null);
            await expect(service.processTelemetry('user-1', { tripId: 'trip-1' } as any)).rejects.toThrow(NotFoundException);
        });

        it('should call telemetryService.handleBatch for active trip', async () => {
            const trip = { id: 'trip-1', user_id_hash: 'user-1', status: TripStatus.ACTIVE };
            mockTripRepository.findById.mockResolvedValue(trip);

            await service.processTelemetry('user-1', { tripId: 'trip-1', points: [] } as any);

            expect(telemetryService.handleBatch).toHaveBeenCalledWith(trip, []);
        });
    });

    describe('triggerSos', () => {
        it('should store encrypted payload, update status, and trigger escalation', async () => {
            const trip = { id: 'trip-1', user_id_hash: 'user-1', status: TripStatus.ACTIVE };
            mockTripRepository.findById.mockResolvedValue(trip);
            mockSosRepository.create.mockResolvedValue({});

            const result = await service.triggerSos('user-1', {
                tripId: 'trip-1',
                encryptedPayload: Buffer.from('payload').toString('base64'),
            });

            expect(result.status).toBe('escalated');
            expect(trip.status).toBe(TripStatus.ESCALATED);
            expect(sosRepository.create).toHaveBeenCalled();
            expect(escalationService.escalateSos).toHaveBeenCalled();
        });
    });
});
