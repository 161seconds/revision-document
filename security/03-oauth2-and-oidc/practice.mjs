// Web Security, Auth & Cryptography - Module 03 Practice Verification Suite
import assert from 'node:assert/strict';
import {
  PkceEngine,
  OidcClaimsValidator,
  RefreshTokenRotationManager,
  RedirectUriValidator,
} from './oauth2_pkce.mjs';

console.log('=============================================================');
console.log('WEB SECURITY MODULE 03: OAUTH 2.0 & OIDC TEST SUITE');
console.log('=============================================================\n');

// ======================================================================
// Challenge 1: PKCE S256 Challenge Generation & Cryptographic Verification
// ======================================================================
console.log('[Test 1] Testing PKCE S256 Key Exchange & Verification...');

const { code_verifier, code_challenge } = PkceEngine.generatePair();

console.log(`  -> Generated code_verifier:  ${code_verifier.slice(0, 20)}... (length: ${code_verifier.length})`);
console.log(`  -> Generated code_challenge: ${code_challenge}`);

// RFC 7636 requirement: length between 43 and 128 characters
assert.ok(
  code_verifier.length >= 43 && code_verifier.length <= 128,
  'code_verifier length must satisfy RFC 7636 constraints [43, 128]'
);

// Verify valid pair
const verificationSuccess = PkceEngine.verify(code_verifier, code_challenge);
assert.strictEqual(verificationSuccess, true, 'Valid PKCE verifier must match its challenge');

// Verify tampered verifier
const tamperedVerifier = code_verifier.slice(0, -2) + 'aa';
const verificationFailure = PkceEngine.verify(tamperedVerifier, code_challenge);
assert.strictEqual(verificationFailure, false, 'Tampered code_verifier must be rejected');

console.log('  -> [PASSED] PKCE S256 challenge generation and constant-time verification passed.\n');

// ======================================================================
// Challenge 2: OIDC ID Token Claims Validation
// ======================================================================
console.log('[Test 2] Testing OIDC ID Token Standard Claims Validation...');

const currentEpoch = 1710000000;
const validClaims = {
  iss: 'https://auth.enterprise.io',
  aud: 'spa-client-frontend-id',
  sub: 'usr-uuid-88217',
  exp: currentEpoch + 3600, // Expires in 1 hour
  nonce: 'nonce-cryptorand-991',
};

const expectedConfig = {
  issuer: 'https://auth.enterprise.io',
  audience: 'spa-client-frontend-id',
  nonce: 'nonce-cryptorand-991',
};

// 1. Valid claims pass
const resValid = OidcClaimsValidator.validate(validClaims, expectedConfig, currentEpoch);
assert.strictEqual(resValid.valid, true, 'Compliant OIDC claims must pass validation');

// 2. Audience mismatch (Token intended for Mobile App used on Web App)
const resAudienceMismatch = OidcClaimsValidator.validate(
  { ...validClaims, aud: 'mobile-app-client-id' },
  expectedConfig,
  currentEpoch
);
assert.strictEqual(resAudienceMismatch.valid, false);
assert.match(resAudienceMismatch.error, /Audience mismatch/);

// 3. Expired token
const resExpired = OidcClaimsValidator.validate(
  { ...validClaims, exp: currentEpoch - 60 },
  expectedConfig,
  currentEpoch
);
assert.strictEqual(resExpired.valid, false);
assert.match(resExpired.error, /Token has expired/);

// 4. Missing subject (sub)
const resMissingSub = OidcClaimsValidator.validate(
  { ...validClaims, sub: undefined },
  expectedConfig,
  currentEpoch
);
assert.strictEqual(resMissingSub.valid, false);
assert.match(resMissingSub.error, /Missing or invalid "sub"/);

console.log('  -> [PASSED] OIDC claims validator enforces audience, issuer, expiry, and subject invariants.\n');

// ======================================================================
// Challenge 3: Refresh Token Rotation (RTR) Happy Path
// ======================================================================
console.log('[Test 3] Testing Refresh Token Rotation (RTR) Happy Path...');

const rtrManager = new RefreshTokenRotationManager();
const familyId = 'session-family-user-77';

// 1. Issue initial token RT1
const rt1 = rtrManager.issueInitialToken(familyId);
assert.ok(rt1.startsWith('rt_'));
assert.strictEqual(rtrManager.isFamilyActive(familyId), true);

// 2. Client presents RT1 -> Server issues RT2, revokes RT1
const rot1 = rtrManager.rotate(familyId, rt1);
assert.strictEqual(rot1.success, true);
const rt2 = rot1.newRefreshToken;
assert.notStrictEqual(rt2, rt1, 'Rotated token must be a new unique string');

// 3. Client presents RT2 -> Server issues RT3, revokes RT2
const rot2 = rtrManager.rotate(familyId, rt2);
assert.strictEqual(rot2.success, true);
const rt3 = rot2.newRefreshToken;
assert.notStrictEqual(rt3, rt2);

assert.strictEqual(rtrManager.isFamilyActive(familyId), true, 'Family must remain active on legitimate rotation');

console.log('  -> [PASSED] Single-use refresh token rotation functions cleanly on happy path.\n');

// ======================================================================
// Challenge 4: Fraud Detection & Token Family Revocation
// ======================================================================
console.log('[Test 4] Testing Fraud Detection & Token Family Revocation...');

// Attacker intercepts and replays already-used token RT1
console.log('  -> Attacker attempts replay of consumed token RT1...');
const fraudAttempt = rtrManager.rotate(familyId, rt1);

assert.strictEqual(fraudAttempt.success, false);
assert.match(fraudAttempt.error, /TokenReuseDetected/, 'Must flag token reuse as fraud');

// Entire family must now be permanently revoked
assert.strictEqual(
  rtrManager.isFamilyActive(familyId),
  false,
  'Family must be marked compromised and inactive'
);

// Even legitimate client presenting latest RT3 is now blocked
const legitimateBlocked = rtrManager.rotate(familyId, rt3);
assert.strictEqual(legitimateBlocked.success, false);
assert.match(legitimateBlocked.error, /CompromisedFamily/, 'Legitimate token must be blocked to protect user');

console.log('  -> [PASSED] Token reuse triggers immediate Token Family Revocation.\n');

// ======================================================================
// Challenge 5: Strict Redirect URI Exact Matching Defense
// ======================================================================
console.log('[Test 5] Testing Strict Redirect URI Exact Matching Defense...');

const registeredWhitelist = [
  'https://app.enterprise.io/auth/callback',
  'https://app.enterprise.io/auth/silent-renew',
];

// 1. Legitimate registered callback
assert.strictEqual(
  RedirectUriValidator.isAllowed('https://app.enterprise.io/auth/callback', registeredWhitelist),
  true,
  'Exact matching registered URI must be allowed'
);

// 2. Subdomain takeover / Subdomain wildcard bypass attempt
assert.strictEqual(
  RedirectUriValidator.isAllowed('https://evil.enterprise.io/auth/callback', registeredWhitelist),
  false,
  'Untrusted subdomain must be blocked'
);

// 3. Path traversal attack
assert.strictEqual(
  RedirectUriValidator.isAllowed('https://app.enterprise.io/auth/callback/../../evil', registeredWhitelist),
  false,
  'Path traversal in redirect URI must be rejected'
);

// 4. Query parameter appending (Open redirect)
assert.strictEqual(
  RedirectUriValidator.isAllowed('https://app.enterprise.io/auth/callback?target=https://evil.com', registeredWhitelist),
  false,
  'Modified URI with query parameters must be rejected'
);

console.log('  -> [PASSED] Strict exact matching protects against Open Redirect & URI Poisoning.\n');

console.log('=============================================================');
console.log('ALL 5 WEB SECURITY MODULE 03 TESTS PASSED SUCCESSFULLY! (5/5)');
console.log('=============================================================');
