import { Test, TestingModule } from '@nestjs/testing';
import { EncryptionService } from './encryption.service';

describe('EncryptionService', () => {
    let service: EncryptionService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [EncryptionService],
        }).compile();

        service = module.get<EncryptionService>(EncryptionService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should encrypt and decrypt data correctly', () => {
        const data = 'sensitive data';
        const encrypted = service.encrypt(data);
        const decrypted = service.decrypt(encrypted);

        expect(decrypted).toBe(data);
        expect(encrypted).not.toBe(data);
        // Should be base64
        expect(Buffer.from(encrypted, 'base64').toString('base64')).toBe(encrypted);
    });

    it('should return a public key', () => {
        const publicKey = service.getPublicKey();
        expect(publicKey).toBeDefined();
        expect(publicKey).toContain('BEGIN RSA PUBLIC KEY');
    });
});
