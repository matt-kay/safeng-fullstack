import { Injectable, Logger } from '@nestjs/common';
import { Trip } from '../entities/trip.entity';
import { FirebaseService } from '../../../infrastructure/firebase/firebase.service';

@Injectable()
export class EscalationService {
  private readonly logger = new Logger(EscalationService.name);

  constructor(private readonly firebaseService: FirebaseService) {}

  /**
   * Escalates a Danger event (SOS or 2+ flags).
   */
  async escalateSos(trip: Trip, encryptedPayload: string): Promise<void> {
    this.logger.error(
      `!!! ESCALATING SOS for trip ${trip.id} (User: ${trip.user_id_hash}) !!!`,
    );
    this.logger.error(`Encrypted Payload: ${encryptedPayload}`);

    // 1. Send push to emergency contacts (Mocked)
    await this.notifyEmergencyContacts(trip);

    // 2. Notify nearby responders (Mocked)
    await this.notifyNearbyResponders(trip);
  }

  async escalateFlags(trip: Trip): Promise<void> {
    this.logger.warn(
      `Trip ${trip.id} escalated due to multiple flags: D:${trip.deviation_flag}, I:${trip.isolation_flag}, S:${trip.signal_loss_flag}`,
    );
    // Notify user or contacts depending on flag combination
  }

  private async notifyEmergencyContacts(trip: Trip) {
    this.logger.log(
      `Notifying emergency contacts for user hash ${trip.user_id_hash}`,
    );
    // Integration with push/SMS provider would go here
  }

  private async notifyNearbyResponders(trip: Trip) {
    this.logger.log(
      `Querying nearby responders in ${trip.city} for trip ${trip.id}`,
    );
    // Integration with Risk Engine to find responders in same grid cell
  }
}
