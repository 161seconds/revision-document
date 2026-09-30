// Automated Verification Test Suite for Module 08: Threat Modeling, Defense-in-Depth & Incident Response
import assert from 'node:assert';
import {
  DREADRiskCalculator,
  NonceCSPManager,
  HashChainedAuditLog,
  SlowlorisDetector,
  CVSSCalculator
} from './threat_incident_engine.mjs';

console.log('=============================================================');
console.log('WEB SECURITY MODULE 08: THREAT MODELING & INCIDENT RESPONSE');
console.log('=============================================================\n');

// Test 1: DREAD Risk Calculation (Critical Remote SQLi vs Low Minor Issue)
console.log('[Test 1] Testing DREAD Threat Risk Scoring & Classification...');
const criticalVuln = DREADRiskCalculator.calculate({
  damage: 10,
  reproducibility: 10,
  exploitability: 9,
  affectedUsers: 10,
  discoverability: 8
});
console.log(`  -> Unauthenticated SQLi DREAD: Score ${criticalVuln.score} -> [${criticalVuln.severity}]`);
assert.strictEqual(criticalVuln.score, 9.4);
assert.strictEqual(criticalVuln.severity, 'CRITICAL');

const minorVuln = DREADRiskCalculator.calculate({
  damage: 2,
  reproducibility: 3,
  exploitability: 2,
  affectedUsers: 1,
  discoverability: 3
});
console.log(`  -> Minor Info Banner DREAD:     Score ${minorVuln.score} -> [${minorVuln.severity}]`);
assert.strictEqual(minorVuln.score, 2.2);
assert.strictEqual(minorVuln.severity, 'LOW');
console.log('  -> [PASSED] DREAD scoring accurately reflects risk magnitude and prioritization.\n');

// Test 2: Nonce-Based Modern CSP Generator & Validator
console.log('[Test 2] Testing Nonce-Based CSP Header Generation & Script Validation...');
const nonce = NonceCSPManager.generateNonce();
const cspHeader = NonceCSPManager.buildHeader(nonce);

console.log(`  -> Generated CSP Header: ${cspHeader}`);
assert.ok(cspHeader.includes(`'nonce-${nonce}'`));
assert.ok(cspHeader.includes(`'strict-dynamic'`));
assert.ok(cspHeader.includes(`frame-ancestors 'none'`));

// Valid script tag with matching nonce
const validScriptHtml = `<script nonce="${nonce}" src="/bundle.js"></script>`;
assert.strictEqual(NonceCSPManager.validateScript(validScriptHtml, nonce), true);

// Injected attacker script without nonce
const attackerScriptHtml = `<script>alert('XSS')</script>`;
assert.strictEqual(NonceCSPManager.validateScript(attackerScriptHtml, nonce), false);

// Injected attacker script with forged / wrong nonce
const forgedScriptHtml = `<script nonce="forged_nonce_12345" src="/malware.js"></script>`;
assert.strictEqual(NonceCSPManager.validateScript(forgedScriptHtml, nonce), false);
console.log('  -> [PASSED] Nonce-based CSP eliminates inline script injection without whitelists.\n');

// Test 3: Tamper-Evident Audit Log with Cryptographic Hash Chaining
console.log('[Test 3] Testing Hash-Chained Audit Log & Tamper Detection...');
const auditLog = new HashChainedAuditLog();

auditLog.append({ actor: 'admin_alice', action: 'CREATE_USER', payload: { user: 'bob' } });
auditLog.append({ actor: 'user_bob', action: 'TRANSFER_FUNDS', payload: { amount: 500, to: 'charlie' } });
auditLog.append({ actor: 'admin_alice', action: 'REVOKE_TOKEN', payload: { user: 'charlie' } });

// 1. Initial integrity check should pass
const initialCheck = auditLog.verifyIntegrity();
assert.strictEqual(initialCheck.isValid, true);
assert.strictEqual(initialCheck.totalEntries, 3);
console.log('  -> Initial 3 log entries verified with unbroken SHA-256 chain.');

// 2. Tampering simulation: Hacker alters entry 1 payload from 500 to 5000000
auditLog.chain[1].payload.amount = 5000000;

const tamperedCheck = auditLog.verifyIntegrity();
console.log(`  -> Tamper detection result: isValid=${tamperedCheck.isValid}, tamperedIndex=${tamperedCheck.tamperedIndex}`);
assert.strictEqual(tamperedCheck.isValid, false);
assert.strictEqual(tamperedCheck.tamperedIndex, 1);
assert.ok(tamperedCheck.reason.includes('Tampered entry contents detected'));
console.log('  -> [PASSED] Cryptographic hash chain immediately detects altered historical logs.\n');

// Test 4: Slowloris L7 Connection Exhaustion Detection
console.log('[Test 4] Testing Slowloris L7 Drip-Feed Connection Exhaustion Defense...');
const slowloris = new SlowlorisDetector(5000, 50);

// Legitimate fast request (completed in 200ms)
const legit = slowloris.inspectConnection({
  socketOpenDurationMs: 200,
  bytesReceived: 1024,
  headersCompleted: true
});
assert.strictEqual(legit.isSlowloris, false);
assert.strictEqual(legit.action, 'ALLOW');

// Slowloris attack: socket open for 8000ms but only sent 12 bytes
const attack = slowloris.inspectConnection({
  socketOpenDurationMs: 8000,
  bytesReceived: 12,
  headersCompleted: false
});
assert.strictEqual(attack.isSlowloris, true);
assert.strictEqual(attack.action, 'TERMINATE_SOCKET');
console.log('  -> [PASSED] Slowloris detector terminates slow drip-feed sockets.\n');

// Test 5: CVSS v3.1 Base Scoring
console.log('[Test 5] Testing CVSS v3.1 Critical Vulnerability Scoring...');
const unauthRCE = CVSSCalculator.calculateBase({
  attackVector: 'NETWORK',
  complexity: 'LOW',
  privileges: 'NONE',
  userInteraction: 'NONE',
  impact: 'HIGH'
});
console.log(`  -> Unauthenticated Remote RCE CVSS: ${unauthRCE.baseScore} -> [${unauthRCE.severity}]`);
assert.ok(unauthRCE.baseScore >= 9.0);
assert.strictEqual(unauthRCE.severity, 'CRITICAL');
console.log('  -> [PASSED] CVSS scoring calculates base impact and critical classification accurately.\n');

console.log('=============================================================');
console.log('ALL 5 WEB SECURITY MODULE 08 TESTS PASSED SUCCESSFULLY! (5/5)');
console.log('=============================================================');
