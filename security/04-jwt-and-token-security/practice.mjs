// Web Security, Auth & Cryptography - Module 04 Practice Verification Suite
import assert from 'node:assert/strict';
import {
  JwtEngine,
  JwksKeyResolver,
  TokenBlacklist,
  base64UrlEncode,
} from './jwt_engine.mjs';

console.log('=============================================================');
console.log('WEB SECURITY MODULE 04: JWT & TOKEN SECURITY TEST SUITE');
console.log('=============================================================\n');

// ======================================================================
// Challenge 1: HS256 Token Signing & Tamper-Proof Verification
// ======================================================================
console.log('[Test 1] Testing HS256 Cryptographic Signing & Tamper Detection...');

const secretKey = 'super_robust_256_bit_cryptographic_secret_key_9921!';
const epochNow = 1710000000;
const claims = {
  sub: 'usr-alice-42',
  role: 'MEMBER',
  exp: epochNow + 3600,
};

const token = JwtEngine.signHs256(claims, secretKey);
console.log(`  -> Signed JWT: ${token.slice(0, 30)}...`);

// 1. Legitimate verification
const decoded = JwtEngine.verify(token, secretKey, {
  allowedAlgorithms: ['HS256'],
  now: epochNow,
});
assert.strictEqual(decoded.sub, 'usr-alice-42');
assert.strictEqual(decoded.role, 'MEMBER');

// 2. Tampering attack: Attacker changes payload to elevate role to ADMIN
const parts = token.split('.');
const tamperedPayload = { ...claims, role: 'ADMIN' };
const tamperedToken = `${parts[0]}.${base64UrlEncode(tamperedPayload)}.${parts[2]}`;

assert.throws(
  () => JwtEngine.verify(tamperedToken, secretKey, { allowedAlgorithms: ['HS256'], now: epochNow }),
  /InvalidSignatureException/,
  'Server must reject tampered token due to signature mismatch'
);

console.log('  -> [PASSED] Cryptographic signature detects payload tampering with mathematical certainty.\n');

// ======================================================================
// Challenge 2: None Algorithm Exploitation Defense
// ======================================================================
console.log('[Test 2] Testing Defense Against "none" Algorithm Exploitation...');

// Attacker constructs token with "alg": "none" and no signature
const noneHeader = base64UrlEncode({ alg: 'none', typ: 'JWT' });
const elevatedPayload = base64UrlEncode({ sub: 'attacker-bob', role: 'SUPERADMIN', exp: epochNow + 3600 });
const exploitToken = `${noneHeader}.${elevatedPayload}.`;

console.log(`  -> Malicious "none" token: ${exploitToken}`);

assert.throws(
  () => JwtEngine.verify(exploitToken, secretKey, { allowedAlgorithms: ['HS256'], now: epochNow }),
  /AlgorithmConfusionException/,
  'Server must strictly reject tokens with "alg": "none"'
);

console.log('  -> [PASSED] "none" algorithm exploit blocked by strict algorithm enforcement.\n');

// ======================================================================
// Challenge 3: Algorithm Confusion Defense (RS256 Whitelist vs HS256)
// ======================================================================
console.log('[Test 3] Testing Algorithm Confusion Defense (Asymmetric Whitelist)...');

// Scenario: Server architecture is configured for RS256 (Public Key verification)
// Attacker crafts token signed with HS256 using server's public key as secret
const attackerToken = JwtEngine.signHs256(claims, secretKey);

assert.throws(
  () =>
    JwtEngine.verify(attackerToken, secretKey, {
      allowedAlgorithms: ['RS256'], // Only RS256 is authorized!
      now: epochNow,
    }),
  /AlgorithmConfusionException/,
  'Server configured for RS256 must reject incoming HS256 tokens'
);

console.log('  -> [PASSED] Explicit algorithm whitelist neutralizes Key Confusion attacks.\n');

// ======================================================================
// Challenge 4: JWKS Key ID (kid) Dynamic Resolution & Rotation
// ======================================================================
console.log('[Test 4] Testing JWKS Dynamic Key ID (kid) Resolution & Rotation...');

const jwks = new JwksKeyResolver();
const KEY_V1 = 'secret_key_generation_2025_v1';
const KEY_V2 = 'secret_key_generation_2026_v2';

jwks.registerKey('key-2025-v1', KEY_V1);
jwks.registerKey('key-2026-v2', KEY_V2);

// Token signed with newer key-2026-v2
const rotatedToken = JwtEngine.signHs256(claims, KEY_V2, { kid: 'key-2026-v2' });

// Client parses header to discover kid
const header = JSON.parse(Buffer.from(rotatedToken.split('.')[0], 'base64url').toString());
assert.strictEqual(header.kid, 'key-2026-v2');

// Resolve key and verify
const resolvedKey = jwks.resolveKey(header.kid);
assert.strictEqual(resolvedKey, KEY_V2);

const verifiedRotated = JwtEngine.verify(rotatedToken, resolvedKey, {
  allowedAlgorithms: ['HS256'],
  now: epochNow,
});
assert.strictEqual(verifiedRotated.sub, 'usr-alice-42');

// Unknown Key ID
assert.throws(
  () => jwks.resolveKey('obsolete-key-1999'),
  /KeyNotFoundException/,
  'Must reject tokens referencing unregistered key IDs'
);

console.log('  -> [PASSED] JWKS key resolver supports seamless zero-downtime key rotation.\n');

// ======================================================================
// Challenge 5: Token Revocation Blacklist via jti
// ======================================================================
console.log('[Test 5] Testing Token Revocation Blacklist via jti...');

const blacklist = new TokenBlacklist();
const targetJti = 'jti-crypto-uuid-992182';

// Initially token is active and valid
assert.strictEqual(blacklist.isRevoked(targetJti), false, 'Token should not be revoked initially');

// User clicks "Log Out" -> Server revokes token with remaining TTL (100ms for test)
blacklist.revoke(targetJti, 100);
assert.strictEqual(blacklist.isRevoked(targetJti), true, 'Revoked token must be blocked immediately');

// Wait 120ms: Token naturally expires in time -> Blacklist auto-cleans memory
await new Promise((resolve) => setTimeout(resolve, 120));
assert.strictEqual(
  blacklist.isRevoked(targetJti),
  false,
  'Expired token must be cleaned up from blacklist memory'
);

console.log('  -> [PASSED] Token blacklist supports instantaneous logout and automatic memory reclamation.\n');

console.log('=============================================================');
console.log('ALL 5 WEB SECURITY MODULE 04 TESTS PASSED SUCCESSFULLY! (5/5)');
console.log('=============================================================');
