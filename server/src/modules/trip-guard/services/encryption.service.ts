import { Injectable, Logger } from '@nestjs/common';
import { generateKeyPairSync, publicEncrypt, privateDecrypt } from 'crypto';

@Injectable()
export class EncryptionService {
  private readonly logger = new Logger(EncryptionService.name);

  // In a real application, these would come from Cloud KMS / Config
  private publicKey: string;
  private privateKey: string;

  constructor() {
    // Mocking key generation for dev
    const { publicKey, privateKey } = generateKeyPairSync('rsa', {
      modulusLength: 2048,
    });
    this.publicKey = publicKey.export({
      type: 'pkcs1',
      format: 'pem',
    }) as string;
    this.privateKey = privateKey.export({
      type: 'pkcs1',
      format: 'pem',
    }) as string;
  }

  encrypt(data: string): string {
    const buffer = Buffer.from(data);
    const encrypted = publicEncrypt(this.publicKey, buffer);
    return encrypted.toString('base64');
  }

  decrypt(encryptedData: string): string {
    const buffer = Buffer.from(encryptedData, 'base64');
    const decrypted = privateDecrypt(this.privateKey, buffer);
    return decrypted.toString('utf8');
  }

  getPublicKey(): string {
    return this.publicKey;
  }
}
