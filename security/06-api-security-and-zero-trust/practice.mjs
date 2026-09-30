// Automated Verification Test Suite for Module 06: API Security, Authorization & Zero Trust
import assert from 'node:assert';
import {
  WebhookSecurityManager,
  MassAssignmentSanitizer,
  ZanzibarReBAC,
  ABACEngine,
  CORSOriginValidator
} from './api_security.mjs';

console.log('=============================================================');
console.log('WEB SECURITY MODULE 06: API & ZERO TRUST TEST SUITE');
console.log('=============================================================\n');

// Test 1: Webhook HMAC-SHA256 Timing-Safe Verification & Replay Defense
console.log('[Test 1] Testing Webhook Signature Verification & Replay Protection...');
const secret = 'whsec_test_secret_998877665544332211';
const rawBody = JSON.stringify({ event: 'charge.succeeded', amount: 5000 });
const validHeader = WebhookSecurityManager.createHeader(secret, rawBody);

console.log(`  -> Webhook Signature Header: ${validHeader}`);
assert.strictEqual(
  WebhookSecurityManager.verify(secret, rawBody, validHeader, 300),
  true,
  'Valid webhook signature must pass verification'
);

// Tampered payload
const tamperedBody = JSON.stringify({ event: 'charge.succeeded', amount: 9999999 });
assert.throws(() => {
  WebhookSecurityManager.verify(secret, tamperedBody, validHeader, 300);
}, /HMAC mismatch/);

// Replay attack: timestamp is 600s old (exceeds 300s tolerance)
const oldTimestamp = Math.floor(Date.now() / 1000) - 600;
const expiredHeader = WebhookSecurityManager.createHeader(secret, rawBody, oldTimestamp);
assert.throws(() => {
  WebhookSecurityManager.verify(secret, rawBody, expiredHeader, 300);
}, /tolerance window/);
console.log('  -> [PASSED] Webhook verification prevents tampering, timing attacks, and replay windows.\n');

// Test 2: Mass Assignment Sanitizer (DTO Whitelisting)
console.log('[Test 2] Testing Mass Assignment Attack Neutralization...');
const untrustedInput = {
  name: 'Bao Nguyen',
  bio: 'Software Architect',
  is_admin: true,
  role: 'super_admin',
  wallet_balance: 1_000_000,
  organization_id: 'tenant_malicious'
};

const allowedProfileFields = ['name', 'bio', 'avatarUrl'];
const safePayload = MassAssignmentSanitizer.sanitize(untrustedInput, allowedProfileFields);

console.log('  -> Sanitized Payload:', safePayload);
assert.deepStrictEqual(safePayload, { name: 'Bao Nguyen', bio: 'Software Architect' });
assert.strictEqual(safePayload.is_admin, undefined, 'Critical permission fields must be stripped');
assert.strictEqual(safePayload.wallet_balance, undefined);
console.log('  -> [PASSED] Mass assignment defense safely extracts only explicitly whitelisted fields.\n');

// Test 3: Google Zanzibar ReBAC Tuple & Inheritance Engine
console.log('[Test 3] Testing ReBAC Relation Tuples & Hierarchy Inference (Zanzibar)...');
const zanzibar = new ZanzibarReBAC();

// Define inheritance: owner -> editor -> viewer
zanzibar.defineInheritance('owner', 'editor');
zanzibar.defineInheritance('editor', 'viewer');

// Add relation tuples
zanzibar.addTuple('doc:system_design', 'owner', 'user:alice');
zanzibar.addTuple('doc:system_design', 'editor', 'user:bob');
zanzibar.addTuple('doc:system_design', 'viewer', 'user:charlie');

// Alice is owner -> should automatically have editor and viewer rights
assert.strictEqual(zanzibar.check('doc:system_design', 'owner', 'user:alice'), true);
assert.strictEqual(zanzibar.check('doc:system_design', 'editor', 'user:alice'), true);
assert.strictEqual(zanzibar.check('doc:system_design', 'viewer', 'user:alice'), true);

// Bob is editor -> has editor and viewer, but NOT owner
assert.strictEqual(zanzibar.check('doc:system_design', 'owner', 'user:bob'), false);
assert.strictEqual(zanzibar.check('doc:system_design', 'editor', 'user:bob'), true);
assert.strictEqual(zanzibar.check('doc:system_design', 'viewer', 'user:bob'), true);

// Charlie is only viewer
assert.strictEqual(zanzibar.check('doc:system_design', 'editor', 'user:charlie'), false);
assert.strictEqual(zanzibar.check('doc:system_design', 'viewer', 'user:charlie'), true);
console.log('  -> [PASSED] Zanzibar ReBAC resolves direct and transitive permission relationships.\n');

// Test 4: ABAC Contextual Policy Engine
console.log('[Test 4] Testing ABAC Contextual Rules Evaluation...');
const abac = new ABACEngine();

abac.addPolicy({
  name: 'DoctorDepartmentAccessDuringHours',
  effect: 'ALLOW',
  condition: ({ subject, resource, action, environment }) => {
    return (
      subject.role === 'doctor' &&
      action === 'read' &&
      resource.type === 'patient_record' &&
      subject.department === resource.department &&
      environment.hour >= 8 &&
      environment.hour <= 18
    );
  }
});

// Authorized case: Dr. Smith reading Cardiology record in department at 14:00
const allowedContext = {
  subject: { id: 'doc_1', role: 'doctor', department: 'Cardiology' },
  resource: { id: 'rec_99', type: 'patient_record', department: 'Cardiology' },
  action: 'read',
  environment: { hour: 14 }
};
assert.strictEqual(abac.evaluate(allowedContext), true);

// Denied case: Wrong department (Neurology)
const wrongDeptContext = {
  ...allowedContext,
  resource: { id: 'rec_99', type: 'patient_record', department: 'Neurology' }
};
assert.strictEqual(abac.evaluate(wrongDeptContext), false);

// Denied case: After hours (23:00)
const afterHoursContext = {
  ...allowedContext,
  environment: { hour: 23 }
};
assert.strictEqual(abac.evaluate(afterHoursContext), false);
console.log('  -> [PASSED] ABAC engine strictly enforces contextual multi-attribute policies.\n');

// Test 5: Strict CORS Origin Validator
console.log('[Test 5] Testing Strict CORS Origin Whitelisting...');
const corsValidator = new CORSOriginValidator(['https://company.com', '*.company.com']);

assert.strictEqual(corsValidator.isAllowed('https://company.com'), true);
assert.strictEqual(corsValidator.isAllowed('https://app.company.com'), true);
assert.strictEqual(corsValidator.isAllowed('https://api.company.com'), true);

// Malicious / Bypassed origins
assert.strictEqual(corsValidator.isAllowed('null'), false, 'null origin must be rejected');
assert.strictEqual(corsValidator.isAllowed('https://evilcompany.com'), false);
assert.strictEqual(corsValidator.isAllowed('https://company.com.attacker.com'), false);
console.log('  -> [PASSED] CORS validator resists regex/subdomain bypasses and null origin exploitation.\n');

console.log('=============================================================');
console.log('ALL 5 WEB SECURITY MODULE 06 TESTS PASSED SUCCESSFULLY! (5/5)');
console.log('=============================================================');
