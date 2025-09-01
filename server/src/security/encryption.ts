import crypto from 'crypto';
import { logger } from '../utils/logger';

export interface EncryptionKey {
  publicKey: string;
  privateKey: string;
  createdAt: Date;
  expiresAt: Date;
}

export interface EncryptedMessage {
  encryptedContent: string;
  iv: string;
  keyId: string;
  signature: string;
}

class EncryptionService {
  private keys: Map<string, EncryptionKey> = new Map();
  private currentKeyId: string = '';

  initialize(): void {
    try {
      this.generateNewKeyPair();
      this.scheduleKeyRotation();
      logger.info('🔒 Encryption service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize encryption service:', error);
      throw error;
    }
  }

  private generateNewKeyPair(): void {
    try {
      // Generate RSA key pair for asymmetric encryption
      const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: {
          type: 'spki',
          format: 'pem'
        },
        privateKeyEncoding: {
          type: 'pkcs8',
          format: 'pem'
        }
      });

      const keyId = crypto.randomUUID();
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours

      const key: EncryptionKey = {
        publicKey,
        privateKey,
        createdAt: now,
        expiresAt
      };

      this.keys.set(keyId, key);
      this.currentKeyId = keyId;

      logger.info(`🔑 New encryption key pair generated: ${keyId}`);
    } catch (error) {
      logger.error('Failed to generate key pair:', error);
      throw error;
    }
  }

  private scheduleKeyRotation(): void {
    // Rotate keys every 12 hours
    setInterval(() => {
      try {
        this.generateNewKeyPair();
        this.cleanupExpiredKeys();
        logger.info('🔄 Encryption keys rotated');
      } catch (error) {
        logger.error('Failed to rotate encryption keys:', error);
      }
    }, 12 * 60 * 60 * 1000);
  }

  private cleanupExpiredKeys(): void {
    const now = new Date();
    for (const [keyId, key] of this.keys.entries()) {
      if (key.expiresAt < now) {
        this.keys.delete(keyId);
        logger.info(`🗑️ Expired encryption key removed: ${keyId}`);
      }
    }
  }

  encryptMessage(content: string, recipientPublicKey?: string): EncryptedMessage {
    try {
      const currentKey = this.keys.get(this.currentKeyId);
      if (!currentKey) {
        throw new Error('No encryption key available');
      }

      // Generate random IV for AES encryption
      const iv = crypto.randomBytes(16);
      
      // Generate random AES key for content encryption
      const aesKey = crypto.randomBytes(32);
      
      // Encrypt content with AES
      const cipher = crypto.createCipher('aes-256-gcm', aesKey);
      let encryptedContent = cipher.update(content, 'utf8', 'hex');
      encryptedContent += cipher.final('hex');
      const authTag = cipher.getAuthTag();

      // Encrypt AES key with RSA public key
      const encryptedAesKey = crypto.publicEncrypt(
        currentKey.publicKey,
        Buffer.from(aesKey)
      );

      // Combine encrypted content, IV, and encrypted AES key
      const combinedData = {
        encryptedContent,
        iv: iv.toString('hex'),
        encryptedAesKey: encryptedAesKey.toString('base64'),
        authTag: authTag.toString('hex')
      };

      // Create signature
      const signature = this.createSignature(JSON.stringify(combinedData), currentKey.privateKey);

      return {
        encryptedContent: JSON.stringify(combinedData),
        iv: iv.toString('hex'),
        keyId: this.currentKeyId,
        signature
      };
    } catch (error) {
      logger.error('Failed to encrypt message:', error);
      throw error;
    }
  }

  decryptMessage(encryptedMessage: EncryptedMessage): string {
    try {
      const key = this.keys.get(encryptedMessage.keyId);
      if (!key) {
        throw new Error('Encryption key not found');
      }

      // Verify signature
      if (!this.verifySignature(encryptedMessage.encryptedContent, encryptedMessage.signature, key.publicKey)) {
        throw new Error('Message signature verification failed');
      }

      const combinedData = JSON.parse(encryptedMessage.encryptedContent);
      
      // Decrypt AES key with RSA private key
      const aesKey = crypto.privateDecrypt(
        key.privateKey,
        Buffer.from(combinedData.encryptedAesKey, 'base64')
      );

      // Decrypt content with AES
      const decipher = crypto.createDecipher('aes-256-gcm', aesKey);
      decipher.setAuthTag(Buffer.from(combinedData.authTag, 'hex'));
      
      let decryptedContent = decipher.update(combinedData.encryptedContent, 'hex', 'utf8');
      decryptedContent += decipher.final('utf8');

      return decryptedContent;
    } catch (error) {
      logger.error('Failed to decrypt message:', error);
      throw error;
    }
  }

  private createSignature(data: string, privateKey: string): string {
    try {
      const sign = crypto.createSign('RSA-SHA256');
      sign.update(data);
      return sign.sign(privateKey, 'base64');
    } catch (error) {
      logger.error('Failed to create signature:', error);
      throw error;
    }
  }

  private verifySignature(data: string, signature: string, publicKey: string): boolean {
    try {
      const verify = crypto.createVerify('RSA-SHA256');
      verify.update(data);
      return verify.verify(publicKey, signature, 'base64');
    } catch (error) {
      logger.error('Failed to verify signature:', error);
      return false;
    }
  }

  getPublicKey(): string {
    const currentKey = this.keys.get(this.currentKeyId);
    if (!currentKey) {
      throw new Error('No encryption key available');
    }
    return currentKey.publicKey;
  }

  getCurrentKeyId(): string {
    return this.currentKeyId;
  }
}

export const encryptionService = new EncryptionService();

export function initializeEncryption(): void {
  encryptionService.initialize();
}
