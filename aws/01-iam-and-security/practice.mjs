import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * ============================================================================
 * AWS MODULE 01: IAM & CLOUD SECURITY - SELF-TEST PRACTICE SUITE
 * ============================================================================
 * Chạy trực tiếp qua Node.js:
 * rtk node aws/01-iam-and-security/practice.mjs
 *
 * Yêu cầu: Tất cả 5 Thử thách phải vượt qua mọi assert mà không có Exception.
 */

console.log('=================================================');
console.log('  AWS MODULE 01: IAM SECURITY TEST SUITE');
console.log('=================================================');

const policyPath = path.join(__dirname, 'iam-policy-production.json');
const policy = JSON.parse(fs.readFileSync(policyPath, 'utf-8'));

// ----------------------------------------------------------------------------
// CHALLENGE 1: Policy Schema & Grammar Compliance
// ----------------------------------------------------------------------------
function testChallenge1_PolicyGrammar() {
    process.stdout.write('[Test 1] Testing IAM Policy Schema & Version Grammar... ');

    assert.strictEqual(policy.Version, '2012-10-17', 'Policy Version must strictly be 2012-10-17');
    assert.ok(Array.isArray(policy.Statement), 'Statement must be an array');
    assert.strictEqual(policy.Statement.length >= 4, true, 'Must contain at least 4 statements');

    for (const stmt of policy.Statement) {
        assert.ok(stmt.Sid, 'Every statement should have a unique Sid');
        assert.ok(['Allow', 'Deny'].includes(stmt.Effect), 'Effect must be either Allow or Deny');
        assert.ok(stmt.Action, 'Statement must declare Action');
        assert.ok(stmt.Resource, 'Statement must declare Resource');
    }

    console.log('PASSED');
}

// ----------------------------------------------------------------------------
// CHALLENGE 2: Least-Privilege Action & Resource Scoping Audit
// ----------------------------------------------------------------------------
function testChallenge2_LeastPrivilegeAudit() {
    process.stdout.write('[Test 2] Auditing Least-Privilege Scoping (No Wildcard in Allow)... ');

    const allowStatements = policy.Statement.filter(s => s.Effect === 'Allow');

    for (const stmt of allowStatements) {
        // Must never allow Action: "*"
        const actions = Array.isArray(stmt.Action) ? stmt.Action : [stmt.Action];
        assert.strictEqual(actions.includes('*'), false, `Statement ${stmt.Sid} must not allow wildcard Action: *`);

        // Must never allow Resource: "*" in an Allow statement
        const resources = Array.isArray(stmt.Resource) ? stmt.Resource : [stmt.Resource];
        assert.strictEqual(resources.includes('*'), false, `Statement ${stmt.Sid} must not allow wildcard Resource: *`);
    }

    // Verify S3 bucket scoping
    const s3Stmt = allowStatements.find(s => s.Sid === 'AllowScopedS3ReportsAccess');
    assert.ok(s3Stmt, 'Must define AllowScopedS3ReportsAccess');
    assert.ok(s3Stmt.Resource.includes('arn:aws:s3:::enterprise-reports-2026'), 'Must scope to specific bucket');

    console.log('PASSED');
}

// ----------------------------------------------------------------------------
// CHALLENGE 3: IAM Evaluation Logic Engine Simulation
// ----------------------------------------------------------------------------
function testChallenge3_EvaluationEngineSimulation() {
    process.stdout.write('[Test 3] Simulating IAM Policy Evaluation Flowchart... ');

    function evaluateRequest({ action, resource, clientIp, mfaPresent }) {
        // Step 1: Check Explicit Deny
        for (const stmt of policy.Statement) {
            if (stmt.Effect === 'Deny') {
                const actions = Array.isArray(stmt.Action) ? stmt.Action : [stmt.Action];
                const matchesAction = actions.some(a => a === '*' || a === action || (a.endsWith('*') && action.startsWith(a.slice(0, -1))));

                if (matchesAction) {
                    // Check MFA Condition
                    if (stmt.Condition?.BoolIfExists?.['aws:MultiFactorAuthPresent'] === 'false' && !mfaPresent) {
                        return 'DENY (Explicit Deny: MFA Missing)';
                    }
                    // Check IP Condition
                    if (stmt.Condition?.NotIpAddress?.['aws:SourceIp']) {
                        const allowedIps = stmt.Condition.NotIpAddress['aws:SourceIp'];
                        const isAllowedIp = allowedIps.some(cidr => clientIp.startsWith(cidr.split('.')[0] + '.' + cidr.split('.')[1]));
                        if (!isAllowedIp) {
                            return 'DENY (Explicit Deny: Untrusted IP)';
                        }
                    }
                }
            }
        }

        // Step 2: Check Explicit Allow
        for (const stmt of policy.Statement) {
            if (stmt.Effect === 'Allow') {
                const actions = Array.isArray(stmt.Action) ? stmt.Action : [stmt.Action];
                const resources = Array.isArray(stmt.Resource) ? stmt.Resource : [stmt.Resource];

                const matchesAction = actions.includes(action);
                const matchesResource = resources.some(r => r === resource || (r.endsWith('/*') && resource.startsWith(r.slice(0, -2))));

                if (matchesAction && matchesResource) {
                    return 'ALLOW';
                }
            }
        }

        // Step 3: Default Implicit Deny
        return 'DENY (Implicit Deny)';
    }

    // Scenario A: Legitimate read from corporate IP with MFA
    const resultA = evaluateRequest({
        action: 's3:GetObject',
        resource: 'arn:aws:s3:::enterprise-reports-2026/q3.pdf',
        clientIp: '198.51.100.45',
        mfaPresent: true
    });
    assert.strictEqual(resultA, 'ALLOW', 'Valid request must be ALLOWED');

    // Scenario B: Attempt delete without MFA
    const resultB = evaluateRequest({
        action: 's3:DeleteObject',
        resource: 'arn:aws:s3:::enterprise-reports-2026/q3.pdf',
        clientIp: '198.51.100.45',
        mfaPresent: false
    });
    assert.strictEqual(resultB.startsWith('DENY (Explicit Deny: MFA Missing)'), true, 'Must trigger explicit deny on MFA missing');

    // Scenario C: Attempt read from coffee shop public IP (Untrusted)
    const resultC = evaluateRequest({
        action: 's3:GetObject',
        resource: 'arn:aws:s3:::enterprise-reports-2026/q3.pdf',
        clientIp: '10.0.0.99',
        mfaPresent: true
    });
    assert.strictEqual(resultC.startsWith('DENY (Explicit Deny: Untrusted IP)'), true, 'Must trigger explicit deny on non-whitelisted IP');

    console.log('PASSED');
}

// ----------------------------------------------------------------------------
// CHALLENGE 4: Multi-Factor Authentication Enforcement Verification
// ----------------------------------------------------------------------------
function testChallenge4_MfaEnforcement() {
    process.stdout.write('[Test 4] Verifying Multi-Factor Authentication Enforcement... ');

    const mfaStmt = policy.Statement.find(s => s.Sid === 'DenySensitiveActionsWithoutMFA');
    assert.ok(mfaStmt, 'Must declare DenySensitiveActionsWithoutMFA');
    assert.strictEqual(mfaStmt.Effect, 'Deny');
    assert.strictEqual(mfaStmt.Condition?.BoolIfExists?.['aws:MultiFactorAuthPresent'], 'false');

    console.log('PASSED');
}

// ----------------------------------------------------------------------------
// CHALLENGE 5: KMS Envelope Encryption Decryption Scoping
// ----------------------------------------------------------------------------
function testChallenge5_KmsViaServiceScoping() {
    process.stdout.write('[Test 5] Verifying KMS Decryption Scoped to S3 Service... ');

    const kmsStmt = policy.Statement.find(s => s.Sid === 'AllowKmsDecryptForS3');
    assert.ok(kmsStmt, 'Must declare AllowKmsDecryptForS3');
    assert.strictEqual(kmsStmt.Effect, 'Allow');
    assert.ok(kmsStmt.Action.includes('kms:Decrypt'));

    // Verify kms:ViaService condition prevents using the key outside S3
    const viaService = kmsStmt.Condition?.StringEquals?.['kms:ViaService'];
    assert.strictEqual(viaService, 's3.ap-southeast-1.amazonaws.com', 'KMS Decrypt must be scoped via S3 service in region');

    console.log('PASSED');
}

// Execute all test challenges
testChallenge1_PolicyGrammar();
testChallenge2_LeastPrivilegeAudit();
testChallenge3_EvaluationEngineSimulation();
testChallenge4_MfaEnforcement();
testChallenge5_KmsViaServiceScoping();

console.log('\n\x1b[32m[SUCCESS] All 5 AWS IAM & Security Challenges Passed! (5/5)\x1b[0m');
