import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * ============================================================================
 * DEVOPS MODULE 05: CI/CD & GITOPS - SELF-TEST PRACTICE SUITE
 * ============================================================================
 * Chạy trực tiếp qua Node.js:
 * rtk node devops/05-cicd-and-gitops/practice.mjs
 *
 * Yêu cầu: Tất cả 5 Thử thách phải vượt qua mọi assert mà không có Exception.
 */

console.log('=================================================');
console.log('  DEVOPS MODULE 05: CI/CD & GITOPS TEST SUITE');
console.log('=================================================');

const workflowPath = path.join(__dirname, 'pipeline-workflow.yaml');
const workflowContent = fs.readFileSync(workflowPath, 'utf-8');

// ----------------------------------------------------------------------------
// CHALLENGE 1: Workflow Triggers & Concurrency Optimization
// ----------------------------------------------------------------------------
function testChallenge1_TriggersAndConcurrency() {
    process.stdout.write('[Test 1] Testing Workflow Triggers & Concurrency Controls... ');

    // Verify triggers
    assert.strictEqual(/on:\s*\n\s*push:/.test(workflowContent), true, 'Must trigger on push');
    assert.strictEqual(/pull_request:/.test(workflowContent), true, 'Must trigger on pull_request');
    assert.strictEqual(workflowContent.includes('branches: [ main ]'), true, 'Must target main branch');

    // Verify concurrency cancel-in-progress
    assert.strictEqual(/concurrency:\s*\n/.test(workflowContent), true, 'Must declare concurrency group');
    assert.strictEqual(/cancel-in-progress:\s*true/.test(workflowContent), true, 'Must enable cancel-in-progress to save runner minutes');

    console.log('PASSED');
}

// ----------------------------------------------------------------------------
// CHALLENGE 2: Cross-Platform Matrix Test Strategy
// ----------------------------------------------------------------------------
function testChallenge2_MatrixTesting() {
    process.stdout.write('[Test 2] Testing Cross-Platform Matrix Testing Strategy... ');

    assert.strictEqual(/strategy:\s*\n\s*fail-fast:\s*false/.test(workflowContent), true, 'Must configure fail-fast: false for full test visibility');
    assert.strictEqual(/matrix:\s*\n/.test(workflowContent), true, 'Must declare matrix strategy');

    // Verify OS and version matrix
    assert.strictEqual(workflowContent.includes('ubuntu-latest'), true, 'Matrix must test ubuntu-latest');
    assert.strictEqual(workflowContent.includes('windows-latest'), true, 'Matrix must test windows-latest');
    assert.strictEqual(/node-version:\s*\[.*20.*22.*\]/.test(workflowContent), true, 'Matrix must cover Node 20 and 22');

    console.log('PASSED');
}

// ----------------------------------------------------------------------------
// CHALLENGE 3: BuildKit Multi-Stage Buildx & Registry Authentication
// ----------------------------------------------------------------------------
function testChallenge3_BuildxAndRegistryAuth() {
    process.stdout.write('[Test 3] Testing Docker Buildx & GHCR Authentication... ');

    assert.strictEqual(workflowContent.includes('docker/setup-buildx-action'), true, 'Must configure Docker Buildx action');
    assert.strictEqual(workflowContent.includes('docker/login-action'), true, 'Must configure Docker login action');
    assert.strictEqual(/registry:\s*ghcr\.io/.test(workflowContent), true, 'Must target GitHub Container Registry ghcr.io');
    assert.strictEqual(workflowContent.includes('secrets.GITHUB_TOKEN'), true, 'Must authenticate using GITHUB_TOKEN');

    console.log('PASSED');
}

// ----------------------------------------------------------------------------
// CHALLENGE 4: DevSecOps Automated Vulnerability Scanning Gate
// ----------------------------------------------------------------------------
function testChallenge4_SecurityScanningGate() {
    process.stdout.write('[Test 4] Testing DevSecOps Vulnerability Scanning Gate... ');

    assert.strictEqual(workflowContent.includes('aquasecurity/trivy-action'), true, 'Must integrate Trivy security vulnerability scanner');
    assert.strictEqual(/exit-code:\s*['"]?1['"]?/.test(workflowContent), true, 'Trivy must return exit code 1 to fail build on CVE discovery');
    assert.strictEqual(/severity:\s*['"]?CRITICAL,HIGH['"]?/.test(workflowContent), true, 'Trivy must filter for CRITICAL and HIGH severity CVEs');
    assert.strictEqual(/ignore-unfixed:\s*true/.test(workflowContent), true, 'Must set ignore-unfixed: true');

    console.log('PASSED');
}

// ----------------------------------------------------------------------------
// CHALLENGE 5: Least Privilege Permissions & Immutable Tagging
// ----------------------------------------------------------------------------
function testChallenge5_PermissionsAndImmutableTags() {
    process.stdout.write('[Test 5] Testing Permissions Hardening & Immutable Tagging... ');

    // Permissions check
    assert.strictEqual(/permissions:\s*\n/.test(workflowContent), true, 'Must declare top-level permissions block');
    assert.strictEqual(/contents:\s*read/.test(workflowContent), true, 'Must restrict contents: read');
    assert.strictEqual(/packages:\s*write/.test(workflowContent), true, 'Must grant packages: write for GHCR push');

    // Immutable tagging check
    assert.strictEqual(workflowContent.includes('docker/metadata-action'), true, 'Must use docker/metadata-action');
    assert.strictEqual(workflowContent.includes('type=sha'), true, 'Must generate immutable commit SHA tags');

    console.log('PASSED');
}

// Execute all test challenges
testChallenge1_TriggersAndConcurrency();
testChallenge2_MatrixTesting();
testChallenge3_BuildxAndRegistryAuth();
testChallenge4_SecurityScanningGate();
testChallenge5_PermissionsAndImmutableTags();

console.log('\n\x1b[32m[SUCCESS] All 5 CI/CD & GitOps Automation Challenges Passed! (5/5)\x1b[0m');
