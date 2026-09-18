// Web Security, Auth & Cryptography - Module 02 Practice Verification Suite
import assert from 'node:assert/strict';
import {
  TotpEngine,
  CookieSecurityValidator,
  LoginAttemptTracker,
  SessionManager,
} from './auth_protocols.mjs';

console.log('=============================================================');
console.log('WEB SECURITY MODULE 02: AUTH & SESSIONS TEST SUITE');
console.log('=============================================================\n');

// ======================================================================
// Challenge 1: RFC 6238 TOTP Token Generation & Verification
// ======================================================================
console.log('[Test 1] Testing RFC 6238 TOTP Token Generation & Verification...');

// Standard RFC test secret: Base32 string "JBSWY3DPEHPK3PXP"
const sharedSecret = 'JBSWY3DPEHPK3PXP';
const testTimestamp = 1710000000000; // Fixed timestamp

const token = TotpEngine.generateToken(sharedSecret, testTimestamp);
console.log(`  -> Generated TOTP Token: ${token} at timestamp ${testTimestamp}`);

assert.strictEqual(token.length, 6, 'TOTP token must be strictly 6 digits');
assert.match(token, /^\d{6}$/, 'TOTP token must consist solely of numbers');

// Verify valid token
const isValid = TotpEngine.verifyToken(token, sharedSecret, 1, testTimestamp);
assert.strictEqual(isValid, true, 'Valid TOTP token must verify as true');

// Verify tampered/invalid token
const invalidToken = token === '111111' ? '222222' : '111111';
assert.strictEqual(
  TotpEngine.verifyToken(invalidToken, sharedSecret, 1, testTimestamp),
  false,
  'Invalid TOTP token must be rejected'
);

console.log('  -> [PASSED] RFC 6238 TOTP generates and verifies time-step codes accurately.\n');

// ======================================================================
// Challenge 2: Clock Drift Window Tolerance in TOTP
// ======================================================================
console.log('[Test 2] Testing TOTP Clock Drift Tolerance Window...');

// Generate token 20 seconds ago (same 30s window or adjacent)
const tokenPast20s = TotpEngine.generateToken(sharedSecret, testTimestamp - 20000);
assert.strictEqual(
  TotpEngine.verifyToken(tokenPast20s, sharedSecret, 1, testTimestamp),
  true,
  'Token within 1-step window (+/- 30s) must be accepted'
);

// Token generated 120 seconds ago (outside window=1)
const tokenPast120s = TotpEngine.generateToken(sharedSecret, testTimestamp - 120000);
assert.strictEqual(
  TotpEngine.verifyToken(tokenPast120s, sharedSecret, 1, testTimestamp),
  false,
  'Token outside drift window must be rejected'
);

console.log('  -> [PASSED] Clock drift window tolerance allows acceptable desynchronization.\n');

// ======================================================================
// Challenge 3: Enterprise Cookie Security Flag Compliance
// ======================================================================
console.log('[Test 3] Testing Cookie Security Flags Audit & Compliance...');

// Insecure cookie config
const insecureCookie = {
  httpOnly: false,
  secure: false,
  sameSite: 'none',
};
const auditInsecure = CookieSecurityValidator.auditCookieOptions(insecureCookie);
assert.strictEqual(auditInsecure.compliant, false, 'Insecure cookie must fail compliance');
assert.ok(auditInsecure.warnings.length >= 3, 'Must report multiple security warnings');

// Production hardened cookie config
const secureCookie = {
  httpOnly: true,
  secure: true,
  sameSite: 'Strict',
};
const auditSecure = CookieSecurityValidator.auditCookieOptions(secureCookie);
assert.strictEqual(auditSecure.compliant, true, 'Hardened cookie options must pass compliance');
assert.strictEqual(auditSecure.warnings.length, 0, 'No warnings should be issued for hardened cookies');

console.log('  -> [PASSED] Cookie security validator enforces Secure, HttpOnly, and SameSite flags.\n');

// ======================================================================
// Challenge 4: Exponential Backoff Against Brute-Force Attacks
// ======================================================================
console.log('[Test 4] Testing Exponential Backoff Login Rate Limiter...');

const tracker = new LoginAttemptTracker();
const attackerTarget = 'victim_ceo@corp.com';

// Initial state: 0 delay
assert.strictEqual(tracker.getRequiredDelaySeconds(attackerTarget), 0);

// 1 failure: Still 0s (grace period for typo)
tracker.recordFailure(attackerTarget);
assert.strictEqual(tracker.getRequiredDelaySeconds(attackerTarget), 0);

// 2 failures: 2^(2-2) = 1s delay
tracker.recordFailure(attackerTarget);
assert.strictEqual(tracker.getRequiredDelaySeconds(attackerTarget), 1);

// 3 failures: 2^(3-2) = 2s delay
tracker.recordFailure(attackerTarget);
assert.strictEqual(tracker.getRequiredDelaySeconds(attackerTarget), 2);

// 4 failures: 2^(4-2) = 4s delay
tracker.recordFailure(attackerTarget);
assert.strictEqual(tracker.getRequiredDelaySeconds(attackerTarget), 4);

// 5 failures: 2^(5-2) = 8s delay
tracker.recordFailure(attackerTarget);
assert.strictEqual(tracker.getRequiredDelaySeconds(attackerTarget), 8);

// User finally types correct password -> success resets backoff
tracker.recordSuccess(attackerTarget);
assert.strictEqual(
  tracker.getRequiredDelaySeconds(attackerTarget),
  0,
  'Successful login must reset failed attempt counter'
);

console.log('  -> [PASSED] Exponential backoff curbs brute-force speeds without lockouts.\n');

// ======================================================================
// Challenge 5: Session Fixation Defense via Re-identification
// ======================================================================
console.log('[Test 5] Testing Session Fixation Defense via Token Regeneration...');

const sessionManager = new SessionManager();

// 1. Attacker or anonymous user gets pre-login session ID
const oldAnonymousSessionId = sessionManager.createAnonymousSession();
assert.ok(oldAnonymousSessionId.length > 32);
const anonSession = sessionManager.getSession(oldAnonymousSessionId);
assert.strictEqual(anonSession.authenticated, false);

// 2. User authenticates successfully -> Server regenerates session ID
const newAuthenticatedSessionId = sessionManager.regenerateOnLogin(oldAnonymousSessionId, {
  userId: 'usr-alice-778',
  email: 'alice@security.org',
});

// Invariant: New session ID must be cryptographically distinct from old session ID
assert.notStrictEqual(
  newAuthenticatedSessionId,
  oldAnonymousSessionId,
  'Session ID must change on privilege level elevation'
);

// Invariant: Old session ID must be immediately deleted from storage
assert.strictEqual(
  sessionManager.getSession(oldAnonymousSessionId),
  undefined,
  'Old session ID must be destroyed to eliminate Session Fixation'
);

// Invariant: New session ID must hold authenticated identity
const newSession = sessionManager.getSession(newAuthenticatedSessionId);
assert.strictEqual(newSession.authenticated, true);
assert.strictEqual(newSession.userId, 'usr-alice-778');

console.log('  -> [PASSED] Session regeneration neutralizes Session Fixation attacks.\n');

console.log('=============================================================');
console.log('ALL 5 WEB SECURITY MODULE 02 TESTS PASSED SUCCESSFULLY! (5/5)');
console.log('=============================================================');
