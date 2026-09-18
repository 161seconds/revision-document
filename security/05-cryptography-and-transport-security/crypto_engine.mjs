// Production-Grade Cryptography & PKI Implementation Suite
import crypto from 'node:crypto';

/**
 * Enterprise AES-256-GCM Authenticated Encryption with Associated Data (AEAD)
 */
export class Aes256GcmEngine {
  /**
   * Encrypts plaintext using AES-256-GCM with a unique 96-bit random IV
   * @param {string|Buffer} plaintext
   * @param {Buffer} key 32-byte (256-bit) encryption key
   * @param {Buffer|string|null} associatedData Optional unencrypted authenticated data
   * @returns {{ ciphertext: string, iv: string, authTag: string }}
   */
  static encrypt(plaintext, key, associatedData = null) {
    if (!Buffer.isBuffer(key) || key.length !== 32) {
      throw new Error('InvalidKeyException: Key must be a 32-byte Buffer for AES-256');
    }

    // 96-bit (12-byte) unique IV as specified by NIST SP 800-38D
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

    if (associatedData) {
      cipher.setAAD(Buffer.isBuffer(associatedData) ? associatedData : Buffer.from(associatedData, 'utf8'));
    }

    const plaintextBuf = Buffer.isBuffer(plaintext) ? plaintext : Buffer.from(plaintext, 'utf8');
    const ciphertext = Buffer.concat([cipher.update(plaintextBuf), cipher.final()]);
    const authTag = cipher.getAuthTag(); // 128-bit (16-byte) MAC tag

    return {
      ciphertext: ciphertext.toString('hex'),
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
    };
  }

  /**
   * Decrypts ciphertext and strictly verifies the 128-bit authentication tag
   * @param {string} ciphertextHex
   * @param {Buffer} key
   * @param {string} ivHex
   * @param {string} authTagHex
   * @param {Buffer|string|null} associatedData
   * @returns {string} Decrypted plaintext in UTF-8
   */
  static decrypt(ciphertextHex, key, ivHex, authTagHex, associatedData = null) {
    if (!Buffer.isBuffer(key) || key.length !== 32) {
      throw new Error('InvalidKeyException: Key must be a 32-byte Buffer');
    }

    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const ciphertext = Buffer.from(ciphertextHex, 'hex');

    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);

    if (associatedData) {
      decipher.setAAD(Buffer.isBuffer(associatedData) ? associatedData : Buffer.from(associatedData, 'utf8'));
    }

    try {
      const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
      return decrypted.toString('utf8');
    } catch {
      throw new Error('AuthTagMismatchException: Ciphertext, IV, or AuthTag has been tampered with');
    }
  }
}

/**
 * Asymmetric Digital Signature Engine (Ed25519)
 */
export class DigitalSignatureEngine {
  /**
   * Generates a modern Ed25519 key pair
   * @returns {{ publicKey: string, privateKey: string }}
   */
  static generateEd25519KeyPair() {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519', {
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    });
    return { publicKey, privateKey };
  }

  /**
   * Signs message using Ed25519 Private Key
   * @param {string|Buffer} message
   * @param {string} privateKeyPem
   * @returns {string} Base64 signature
   */
  static sign(message, privateKeyPem) {
    const msgBuf = Buffer.isBuffer(message) ? message : Buffer.from(message, 'utf8');
    const signature = crypto.sign(null, msgBuf, privateKeyPem);
    return signature.toString('base64');
  }

  /**
   * Verifies signature using Ed25519 Public Key
   * @param {string|Buffer} message
   * @param {string} signatureBase64
   * @param {string} publicKeyPem
   * @returns {boolean}
   */
  static verify(message, signatureBase64, publicKeyPem) {
    try {
      const msgBuf = Buffer.isBuffer(message) ? message : Buffer.from(message, 'utf8');
      const sigBuf = Buffer.from(signatureBase64, 'base64');
      return crypto.verify(null, msgBuf, publicKeyPem, sigBuf);
    } catch {
      return false;
    }
  }
}

/**
 * Elliptic Curve Diffie-Hellman (ECDH) Key Exchange Engine
 */
export class EcdhKeyExchange {
  /**
   * Simulates mutual ECDH shared secret derivation between two parties
   * @param {string} curveName e.g. 'prime256v1'
   * @returns {{ aliceSecret: Buffer, bobSecret: Buffer, derivedAesKey: Buffer }}
   */
  static simulateExchange(curveName = 'prime256v1') {
    const alice = crypto.createECDH(curveName);
    alice.generateKeys();

    const bob = crypto.createECDH(curveName);
    bob.generateKeys();

    // Exchange public keys over untrusted channel
    const alicePublicKey = alice.getPublicKey();
    const bobPublicKey = bob.getPublicKey();

    // Both derive shared secret independently
    const aliceSecret = alice.computeSecret(bobPublicKey);
    const bobSecret = bob.computeSecret(alicePublicKey);

    // Derive 256-bit AES key using HKDF-SHA256 from shared secret
    const salt = Buffer.from('tls13-key-exchange-salt');
    const info = Buffer.from('aes-256-gcm session key');
    const derivedAesKey = Buffer.from(crypto.hkdfSync('sha256', aliceSecret, salt, info, 32));

    return { aliceSecret, bobSecret, derivedAesKey };
  }
}

/**
 * X.509 Certificate Chain of Trust Validator Simulation
 */
export class CertificateChainValidator {
  /**
   * Validates a 3-tier certificate chain: Root CA -> Intermediate CA -> Leaf Cert
   * @param {Object} leaf
   * @param {Object} intermediate
   * @param {Object} root
   * @returns {{ valid: boolean, error?: string }}
   */
  static validateChain(leaf, intermediate, root) {
    const now = Date.now();

    // Check expiration
    for (const cert of [leaf, intermediate, root]) {
      if (now < cert.notBefore || now > cert.notAfter) {
        return { valid: false, error: `Certificate "${cert.commonName}" has expired or is not yet valid` };
      }
    }

    // Verify Root is Self-Signed and in Trusted Store
    if (root.issuer !== root.subject) {
      return { valid: false, error: 'Root CA must be self-signed' };
    }
    if (!root.isTrustedRoot) {
      return { valid: false, error: 'Root CA is not in system trusted store' };
    }

    // Verify Intermediate was signed by Root
    if (intermediate.issuer !== root.subject) {
      return { valid: false, error: 'Intermediate CA was not signed by Root CA' };
    }

    // Verify Leaf was signed by Intermediate
    if (leaf.issuer !== intermediate.subject) {
      return { valid: false, error: 'Leaf certificate was not signed by Intermediate CA' };
    }

    return { valid: true };
  }
}
