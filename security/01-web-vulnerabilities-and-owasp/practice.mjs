// Web Security, Auth & Cryptography - Module 01 Practice Verification Suite
import assert from 'node:assert/strict';
import {
  HtmlContextualEncoder,
  SsrfUrlValidator,
  CsrfTokenManager,
  IdorAccessController,
} from './owasp_defenses.mjs';

console.log('=============================================================');
console.log('WEB SECURITY MODULE 01: OWASP TOP 10 DEFENSES TEST SUITE');
console.log('=============================================================\n');

// ======================================================================
// Challenge 1: SQL Injection vs Parameterized Execution Simulation
// ======================================================================
console.log('[Test 1] Testing SQL Injection Defense via Parameterized Statements...');

class MockDatabaseEngine {
  constructor() {
    this.table = [
      { id: 1, username: 'admin', role: 'SUPERUSER' },
      { id: 2, username: 'bob', role: 'USER' },
    ];
  }

  // Vulnerable simulation: string concatenation
  queryVulnerable(username) {
    const rawSql = `SELECT * FROM users WHERE username = '${username}'`;
    // If injection payload matches `' OR '1'='1`, it returns all records
    if (username.includes("' OR '1'='1")) {
      return this.table; // Leak everything!
    }
    return this.table.filter((u) => u.username === username);
  }

  // Safe simulation: parameterized execution
  queryParameterized(sql, params) {
    const targetUsername = params[0]; // Treated strictly as raw literal data
    return this.table.filter((u) => u.username === targetUsername);
  }
}

const db = new MockDatabaseEngine();
const maliciousInput = "admin' OR '1'='1' --";

// Vulnerable query returns all records (2 users)
const vulnerableResult = db.queryVulnerable(maliciousInput);
assert.strictEqual(vulnerableResult.length, 2, 'Vulnerable query leaks entire table on SQLi');

// Parameterized query treats input as literal string and finds 0 matches
const safeResult = db.queryParameterized(
  'SELECT * FROM users WHERE username = ?',
  [maliciousInput]
);
assert.strictEqual(safeResult.length, 0, 'Parameterized query must treat malicious payload strictly as literal data');

console.log('  -> [PASSED] Parameterized statements completely neutralize SQL Injection.\n');

// ======================================================================
// Challenge 2: XSS Contextual HTML Body & Attribute Encoding
// ======================================================================
console.log('[Test 2] Testing Contextual Output Encoding for XSS Defense...');

const xssPayloadBody = "<script>alert('XSS & Steal Cookies')</script>";
const encodedBody = HtmlContextualEncoder.encodeHtmlBody(xssPayloadBody);

console.log(`  -> Raw Body Payload: ${xssPayloadBody}`);
console.log(`  -> Encoded Body:     ${encodedBody}`);

assert.strictEqual(
  encodedBody,
  '&lt;script&gt;alert(&#x27;XSS &amp; Steal Cookies&#x27;)&lt;/script&gt;',
  'HTML body encoder must escape <, >, &, and quotes'
);
assert.ok(!encodedBody.includes('<script>'), 'Encoded body must not contain executable script tags');

const xssPayloadAttr = '" onfocus="alert(1)" autofocus="';
const encodedAttr = HtmlContextualEncoder.encodeHtmlAttribute(xssPayloadAttr);

console.log(`  -> Raw Attr Payload: ${xssPayloadAttr}`);
console.log(`  -> Encoded Attr:     ${encodedAttr}`);

assert.ok(!encodedAttr.includes('"'), 'HTML attribute encoder must strictly hex-encode quotation marks');
assert.ok(!encodedAttr.includes('='), 'HTML attribute encoder must encode equals signs');

console.log('  -> [PASSED] Contextual encoding protects both HTML Body and Attribute contexts.\n');

// ======================================================================
// Challenge 3: SSRF Metadata & Private IP Range Detection
// ======================================================================
console.log('[Test 3] Testing SSRF Defense Against Cloud Metadata & Private IPs...');

// 1. AWS Cloud Metadata
const cloudMetadataCheck = SsrfUrlValidator.validateUrl('http://169.254.169.254/latest/meta-data/');
assert.strictEqual(cloudMetadataCheck.safe, false, 'Must block AWS Cloud Metadata IP');
assert.strictEqual(cloudMetadataCheck.reason, 'Private/Link-Local IP address blocked');

// 2. Localhost loopback
const localhostCheck = SsrfUrlValidator.validateUrl('http://localhost:8080/internal/admin');
assert.strictEqual(localhostCheck.safe, false, 'Must block localhost');
assert.strictEqual(localhostCheck.reason, 'Loopback target forbidden');

// 3. RFC 1918 Private Ranges
assert.strictEqual(SsrfUrlValidator.validateUrl('http://10.0.0.1/status').safe, false);
assert.strictEqual(SsrfUrlValidator.validateUrl('http://192.168.1.1/config').safe, false);
assert.strictEqual(SsrfUrlValidator.validateUrl('http://172.16.5.10/database').safe, false);

// 4. File / Non-HTTP protocols
const fileCheck = SsrfUrlValidator.validateUrl('file:///etc/passwd');
assert.strictEqual(fileCheck.safe, false);

// 5. Legitimate Public URLs
const legitimateCheck = SsrfUrlValidator.validateUrl('https://api.github.com/users/octocat');
assert.strictEqual(legitimateCheck.safe, true, 'Legitimate public HTTPS URLs must be permitted');

console.log('  -> [PASSED] SSRF validator strictly isolates internal cloud infrastructure.\n');

// ======================================================================
// Challenge 4: CSRF Timing-Safe HMAC Token Validation
// ======================================================================
console.log('[Test 4] Testing CSRF Timing-Safe HMAC Token Validation...');

const csrfManager = new CsrfTokenManager('super_secret_enterprise_signing_key_42');
const validSessionId = 'sess_user_alpha_9921';
const attackerSessionId = 'sess_hacker_evil_6666';

// 1. Generate valid token bound to validSessionId
const token = csrfManager.generateToken(validSessionId, 3600000); // 1-hour TTL
assert.strictEqual(csrfManager.validateToken(token, validSessionId), true, 'Valid token must be accepted');

// 2. Cross-Session Token Replay Attack: Attacker tries using their token for victim's session
assert.strictEqual(
  csrfManager.validateToken(token, attackerSessionId),
  false,
  'Token bound to user alpha must be rejected for user beta'
);

// 3. Tampered Token (altered payload or signature)
const tamperedToken = token.slice(0, -4) + 'abcd';
assert.strictEqual(csrfManager.validateToken(tamperedToken, validSessionId), false, 'Tampered token must be rejected');

// 4. Expired Token
const expiredToken = csrfManager.generateToken(validSessionId, -1000); // Expired 1 second ago
assert.strictEqual(csrfManager.validateToken(expiredToken, validSessionId), false, 'Expired token must be rejected');

console.log('  -> [PASSED] CSRF token manager enforces session binding, integrity, and expiration.\n');

// ======================================================================
// Challenge 5: IDOR / BOLA Server-Side Access Control Invariant
// ======================================================================
console.log('[Test 5] Testing IDOR Server-Side Access Control Invariants...');

const invoiceDocument = {
  id: 'inv-89218',
  ownerId: 'user-alice-101',
  amount: 4500,
  taxCode: 'US-CA-94103',
};

// 1. Legitimate owner access
assert.strictEqual(
  IdorAccessController.canAccess(invoiceDocument, 'user-alice-101', 'user'),
  true,
  'Owner must be granted access to their own document'
);

// 2. Attacker attempting IDOR by changing document ID
assert.strictEqual(
  IdorAccessController.canAccess(invoiceDocument, 'user-mallory-666', 'user'),
  false,
  'Non-owner user must be strictly denied access'
);

// 3. Superadmin override access
assert.strictEqual(
  IdorAccessController.canAccess(invoiceDocument, 'admin-bob-001', 'admin'),
  true,
  'Admin role must be granted administrative oversight'
);

console.log('  -> [PASSED] IDOR protection guarantees server-side ownership enforcement.\n');

console.log('=============================================================');
console.log('ALL 5 WEB SECURITY MODULE 01 TESTS PASSED SUCCESSFULLY! (5/5)');
console.log('=============================================================');
