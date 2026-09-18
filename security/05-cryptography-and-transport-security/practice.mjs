// Web Security, Auth & Cryptography - Module 05 Practice Verification Suite
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {
  Aes256GcmEngine,
  DigitalSignatureEngine,
  EcdhKeyExchange,
  CertificateChainValidator,
} from './crypto_engine.mjs';

console.log('=============================================================');
console.log('WEB SECURITY MODULE 05: CRYPTOGRAPHY & PKI TEST SUITE');
console.log('=============================================================\n');

// ======================================================================
// Challenge 1: AES-256-GCM AEAD Encrypt, Decrypt & Tamper Defense
// ======================================================================
console.log('[Test 1] Testing AES-256-GCM AEAD Encrypt, Decrypt & Tamper Defense...');

const aesKey = crypto.randomBytes(32); // 256-bit key
const secretMessage = 'CONFIDENTIAL_PAYROLL_DATA: $8,450,000.00';

const encrypted = Aes256GcmEngine.encrypt(secretMessage, aesKey);
console.log(`  -> Ciphertext (Hex): ${encrypted.ciphertext.slice(0, 32)}...`);
console.log(`  -> IV (12 bytes):    ${encrypted.iv}`);
console.log(`  -> AuthTag (16B):    ${encrypted.authTag}`);

// 1. Legitimate Decryption
const decrypted = Aes256GcmEngine.decrypt(
  encrypted.ciphertext,
  aesKey,
  encrypted.iv,
  encrypted.authTag
);
assert.strictEqual(decrypted, secretMessage, 'Decrypted text must strictly match original plaintext');

// 2. Tampering Detection: Alter 1 byte in ciphertext
const tamperedCiphertext =
  encrypted.ciphertext.slice(0, 2) === 'aa'
    ? 'bb' + encrypted.ciphertext.slice(2)
    : 'aa' + encrypted.ciphertext.slice(2);

assert.throws(
  () => Aes256GcmEngine.decrypt(tamperedCiphertext, aesKey, encrypted.iv, encrypted.authTag),
  /AuthTagMismatchException/,
  'AES-GCM must throw AuthTagMismatchException when ciphertext is tampered with'
);

console.log('  -> [PASSED] AES-256-GCM guarantees confidentiality and detects tampering instantly.\n');

// ======================================================================
// Challenge 2: Associated Data (AAD) Cryptographic Binding
// ======================================================================
console.log('[Test 2] Testing Authenticated Additional Data (AAD) Integrity Binding...');

const aad = 'tenant_id=corp_us_east_42';
const encWithAad = Aes256GcmEngine.encrypt(secretMessage, aesKey, aad);

// 1. Decrypt with correct AAD succeeds
const decWithAad = Aes256GcmEngine.decrypt(
  encWithAad.ciphertext,
  aesKey,
  encWithAad.iv,
  encWithAad.authTag,
  aad
);
assert.strictEqual(decWithAad, secretMessage);

// 2. Attacker alters unencrypted metadata / AAD
assert.throws(
  () =>
    Aes256GcmEngine.decrypt(
      encWithAad.ciphertext,
      aesKey,
      encWithAad.iv,
      encWithAad.authTag,
      'tenant_id=corp_us_west_99' // altered metadata!
    ),
  /AuthTagMismatchException/,
  'Altering unencrypted Associated Data must cause decryption to fail'
);

console.log('  -> [PASSED] AAD binds cleartext metadata cryptographically to authentication tag.\n');

// ======================================================================
// Challenge 3: Ed25519 Modern Asymmetric Digital Signatures
// ======================================================================
console.log('[Test 3] Testing Ed25519 Digital Signature & Non-Repudiation...');

const { publicKey, privateKey } = DigitalSignatureEngine.generateEd25519KeyPair();
const contractText = 'AGREEMENT: Transfer 50 Bitcoin to Wallet 0x9921ab8872';

const signature = DigitalSignatureEngine.sign(contractText, privateKey);
console.log(`  -> Ed25519 Signature (Base64): ${signature}`);

// 1. Verify valid contract and signature
const isSigValid = DigitalSignatureEngine.verify(contractText, signature, publicKey);
assert.strictEqual(isSigValid, true, 'Valid signature must verify with corresponding public key');

// 2. Tampered contract text (Attacker alters transfer amount to 500 Bitcoin)
const tamperedContract = 'AGREEMENT: Transfer 500 Bitcoin to Wallet 0x9921ab8872';
const isTamperedValid = DigitalSignatureEngine.verify(tamperedContract, signature, publicKey);
assert.strictEqual(isTamperedValid, false, 'Tampered document must fail signature verification');

console.log('  -> [PASSED] Ed25519 digital signature enforces data integrity and non-repudiation.\n');

// ======================================================================
// Challenge 4: ECDH Shared Secret & HKDF Key Derivation
// ======================================================================
console.log('[Test 4] Testing Elliptic Curve Diffie-Hellman (ECDH) Key Exchange...');

const exchange = EcdhKeyExchange.simulateExchange('prime256v1');

console.log(`  -> Alice Shared Secret (Hex): ${exchange.aliceSecret.toString('hex').slice(0, 32)}...`);
console.log(`  -> Bob Shared Secret (Hex):   ${exchange.bobSecret.toString('hex').slice(0, 32)}...`);

// Invariant: Both parties must calculate identical shared secret over public channel
assert.strictEqual(
  crypto.timingSafeEqual(exchange.aliceSecret, exchange.bobSecret),
  true,
  'Alice and Bob must compute identical shared secret from independent public keys'
);

// Derived AES key must be 32 bytes (256 bits)
assert.strictEqual(exchange.derivedAesKey.length, 32, 'HKDF derived AES key must be 32 bytes');

console.log('  -> [PASSED] ECDH establishes shared secrets with Perfect Forward Secrecy.\n');

// ======================================================================
// Challenge 5: X.509 Certificate Chain of Trust Verification
// ======================================================================
console.log('[Test 5] Testing X.509 Certificate Chain of Trust Validation...');

const now = Date.now();
const oneYear = 365 * 24 * 60 * 60 * 1000;

const mockRootCA = {
  commonName: 'DigiTrust Global Root CA',
  subject: 'CN=DigiTrust Global Root CA',
  issuer: 'CN=DigiTrust Global Root CA', // Self-signed
  isTrustedRoot: true,
  notBefore: now - oneYear,
  notAfter: now + oneYear * 10,
};

const mockIntermediateCA = {
  commonName: 'DigiTrust Server TLS Intermediate CA',
  subject: 'CN=DigiTrust Server TLS Intermediate CA',
  issuer: 'CN=DigiTrust Global Root CA', // Signed by Root
  isTrustedRoot: false,
  notBefore: now - oneYear,
  notAfter: now + oneYear * 5,
};

const mockLeafCert = {
  commonName: '*.enterprise.io',
  subject: 'CN=*.enterprise.io',
  issuer: 'CN=DigiTrust Server TLS Intermediate CA', // Signed by Intermediate
  isTrustedRoot: false,
  notBefore: now - oneYear,
  notAfter: now + oneYear,
};

// 1. Valid chain passes
const validChain = CertificateChainValidator.validateChain(mockLeafCert, mockIntermediateCA, mockRootCA);
assert.strictEqual(validChain.valid, true, 'Valid 3-tier certificate chain must pass');

// 2. Broken chain: Leaf forged with untrusted issuer
const forgedLeaf = { ...mockLeafCert, issuer: 'CN=Untrusted Fake CA' };
const brokenChain = CertificateChainValidator.validateChain(forgedLeaf, mockIntermediateCA, mockRootCA);
assert.strictEqual(brokenChain.valid, false);
assert.match(brokenChain.error, /Leaf certificate was not signed by Intermediate CA/);

// 3. Expired certificate
const expiredLeaf = { ...mockLeafCert, notAfter: now - 1000 };
const expiredChain = CertificateChainValidator.validateChain(expiredLeaf, mockIntermediateCA, mockRootCA);
assert.strictEqual(expiredChain.valid, false);
assert.match(expiredChain.error, /expired/);

console.log('  -> [PASSED] X.509 chain of trust prevents Man-in-the-Middle certificate forgery.\n');

console.log('=============================================================');
console.log('ALL 5 WEB SECURITY MODULE 05 TESTS PASSED SUCCESSFULLY! (5/5)');
console.log('=============================================================');
