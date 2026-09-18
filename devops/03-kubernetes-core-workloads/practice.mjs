import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * ============================================================================
 * DEVOPS MODULE 03: KUBERNETES WORKLOADS - SELF-TEST PRACTICE SUITE
 * ============================================================================
 * Chạy trực tiếp qua Node.js:
 * rtk node devops/03-kubernetes-core-workloads/practice.mjs
 *
 * Yêu cầu: Tất cả 5 Thử thách phải vượt qua mọi assert mà không có Exception.
 */

console.log('=================================================');
console.log('  DEVOPS MODULE 03: K8S WORKLOADS TEST SUITE');
console.log('=================================================');

const deploymentPath = path.join(__dirname, 'deployment.yaml');
const yamlContent = fs.readFileSync(deploymentPath, 'utf-8');

// ----------------------------------------------------------------------------
// CHALLENGE 1: Deployment & ReplicaSet Topology Verification
// ----------------------------------------------------------------------------
function testChallenge1_DeploymentTopology() {
    process.stdout.write('[Test 1] Testing Deployment & ReplicaSet Specification... ');

    assert.strictEqual(/apiVersion:\s*apps\/v1/m.test(yamlContent), true, 'apiVersion must be apps/v1');
    assert.strictEqual(/kind:\s*Deployment/m.test(yamlContent), true, 'kind must be Deployment');

    const replicasMatch = yamlContent.match(/replicas:\s*(\d+)/);
    assert.ok(replicasMatch, 'Must specify replicas count');
    const replicas = parseInt(replicasMatch[1], 10);
    assert.strictEqual(replicas >= 3, true, 'Replicas must be >= 3 for high availability');

    // Label selector matching
    const hasSelectorMatchLabels = /selector:\s*\n\s*matchLabels:\s*\n\s*app\.kubernetes\.io\/name:\s*([a-zA-Z0-9_-]+)/.test(yamlContent);
    assert.strictEqual(hasSelectorMatchLabels, true, 'Deployment must define selector.matchLabels');

    console.log('PASSED');
}

// ----------------------------------------------------------------------------
// CHALLENGE 2: Zero-Downtime Rolling Update Strategy Verification
// ----------------------------------------------------------------------------
function testChallenge2_ZeroDowntimeStrategy() {
    process.stdout.write('[Test 2] Testing Zero-Downtime RollingUpdate Math... ');

    assert.strictEqual(/type:\s*RollingUpdate/m.test(yamlContent), true, 'strategy.type must be RollingUpdate');

    // maxUnavailable must be strictly 0 to ensure capacity never dips below 100%
    const maxUnavailableMatch = yamlContent.match(/maxUnavailable:\s*(\d+)/);
    assert.ok(maxUnavailableMatch, 'Must define maxUnavailable');
    assert.strictEqual(parseInt(maxUnavailableMatch[1], 10), 0, 'maxUnavailable MUST be 0 for Zero-Downtime guarantee');

    // maxSurge must be defined
    assert.strictEqual(/maxSurge:\s*(\d+|"\d+%")/m.test(yamlContent), true, 'Must define maxSurge');

    console.log('PASSED');
}

// ----------------------------------------------------------------------------
// CHALLENGE 3: Triple Health Probes Completeness
// ----------------------------------------------------------------------------
function testChallenge3_TripleHealthProbes() {
    process.stdout.write('[Test 3] Testing Complete Triple Health Probes (Startup, Ready, Live)... ');

    assert.strictEqual(/startupProbe:\s*\n/.test(yamlContent), true, 'Must implement startupProbe for slow start protection');
    assert.strictEqual(/readinessProbe:\s*\n/.test(yamlContent), true, 'Must implement readinessProbe for traffic routing');
    assert.strictEqual(/livenessProbe:\s*\n/.test(yamlContent), true, 'Must implement livenessProbe for deadlock recovery');

    // Check paths
    assert.strictEqual(yamlContent.includes('/health/startup'), true, 'startupProbe must check /health/startup');
    assert.strictEqual(yamlContent.includes('/health/ready'), true, 'readinessProbe must check /health/ready');
    assert.strictEqual(yamlContent.includes('/health/live'), true, 'livenessProbe must check /health/live');

    console.log('PASSED');
}

// ----------------------------------------------------------------------------
// CHALLENGE 4: Resource Allocation & QoS Guarantee
// ----------------------------------------------------------------------------
function testChallenge4_ResourceManagement() {
    process.stdout.write('[Test 4] Testing Resource Requests/Limits & QoS Allocation... ');

    assert.strictEqual(/resources:\s*\n\s*requests:\s*\n\s*cpu:/.test(yamlContent), true, 'Must declare requests.cpu');
    assert.strictEqual(/memory:\s*"\d+Mi"/.test(yamlContent), true, 'Must declare requests.memory');
    assert.strictEqual(/limits:\s*\n\s*cpu:/.test(yamlContent), true, 'Must declare limits.cpu');

    // Verify limit is greater than request (Burstable QoS)
    const reqMemMatch = yamlContent.match(/requests:[\s\S]*?memory:\s*"(\d+)Mi"/);
    const limMemMatch = yamlContent.match(/limits:[\s\S]*?memory:\s*"(\d+)Mi"/);
    assert.ok(reqMemMatch && limMemMatch, 'Both memory request and limit must be in Mi');

    const reqMem = parseInt(reqMemMatch[1], 10);
    const limMem = parseInt(limMemMatch[1], 10);
    assert.strictEqual(limMem > reqMem, true, 'Memory limit must be greater than request for Burstable QoS');

    console.log('PASSED');
}

// ----------------------------------------------------------------------------
// CHALLENGE 5: Pod Security Standards Hardening
// ----------------------------------------------------------------------------
function testChallenge5_SecurityHardening() {
    process.stdout.write('[Test 5] Testing Pod Security Standards (Restricted Profile)... ');

    assert.strictEqual(/runAsNonRoot:\s*true/m.test(yamlContent), true, 'Must enforce runAsNonRoot: true');
    assert.strictEqual(/allowPrivilegeEscalation:\s*false/m.test(yamlContent), true, 'Must set allowPrivilegeEscalation: false');
    assert.strictEqual(/readOnlyRootFilesystem:\s*true/m.test(yamlContent), true, 'Must set readOnlyRootFilesystem: true');
    assert.strictEqual(yamlContent.includes('drop:\n            - ALL'), true, 'Must drop ALL Linux capabilities');

    console.log('PASSED');
}

// Execute all test challenges
testChallenge1_DeploymentTopology();
testChallenge2_ZeroDowntimeStrategy();
testChallenge3_TripleHealthProbes();
testChallenge4_ResourceManagement();
testChallenge5_SecurityHardening();

console.log('\n\x1b[32m[SUCCESS] All 5 Kubernetes Core Workloads Challenges Passed! (5/5)\x1b[0m');
