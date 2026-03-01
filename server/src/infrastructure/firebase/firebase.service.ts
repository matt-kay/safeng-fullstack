import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseService.name);
  private firebaseApp: admin.app.App;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    if (!admin.apps.length) {
      const isEmulatorEnabled = this.configService.get<string>('FIREBASE_AUTH_EMULATOR_HOST') || this.configService.get<string>('FIRESTORE_EMULATOR_HOST');

      this.firebaseApp = admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        // Only set projectId explicitly if needed for the emulator setup
        ...(isEmulatorEnabled ? { projectId: 'safeng-dev' } : {}),
      });

      if (isEmulatorEnabled) {
        this.logger.log('Initializing Firebase Admin SDK using Emulator configuration.');
      } else {
        this.logger.log('Initializing Firebase Admin SDK using Application Default Credentials.');
      }
    } else {
      this.firebaseApp = admin.app();
    }
  }

  get auth(): admin.auth.Auth {
    return this.firebaseApp.auth();
  }

  get firestore(): admin.firestore.Firestore {
    return this.firebaseApp.firestore();
  }
}
