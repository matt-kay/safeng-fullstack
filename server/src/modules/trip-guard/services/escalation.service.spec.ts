import { Test, TestingModule } from '@nestjs/testing';
import { EscalationService } from './escalation.service';
import { FirebaseService } from '../../../infrastructure/firebase/firebase.service';
import { Trip } from '../entities/trip.entity';

describe('EscalationService', () => {
    let service: EscalationService;
    let firebaseService: FirebaseService;

    const mockFirebaseService = {
        // Mock methods if any are used in the service
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                EscalationService,
                { provide: FirebaseService, useValue: mockFirebaseService },
            ],
        }).compile();

        service = module.get<EscalationService>(EscalationService);
        firebaseService = module.get<FirebaseService>(FirebaseService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('escalateSos', () => {
        it('should log escalation details', async () => {
            const trip = { id: 'trip-1', user_id_hash: 'hash-1', city: 'Lagos' } as Trip;
            const logSpy = jest.spyOn((service as any).logger, 'error');

            await service.escalateSos(trip, 'encrypted-payload');

            expect(logSpy).toHaveBeenCalled();
        });
    });

    describe('escalateFlags', () => {
        it('should log flag escalation details', async () => {
            const trip = { id: 'trip-1', deviation_flag: true, isolation_flag: true, signal_loss_flag: false } as Trip;
            const logSpy = jest.spyOn((service as any).logger, 'warn');

            await service.escalateFlags(trip);

            expect(logSpy).toHaveBeenCalled();
        });
    });
});
