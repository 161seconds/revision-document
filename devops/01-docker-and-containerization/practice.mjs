import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * ============================================================================
 * DEVOPS MODULE 01: DOCKER & CONTAINERIZATION - SELF-TEST PRACTICE SUITE
 * ============================================================================
 * Chạy trực tiếp qua Node.js:
 * rtk node devops/01-docker-and-containerization/practice.mjs
 *
 * Yêu cầu: Tất cả 5 Thử thách phải vượt qua mọi assert mà không có Exception.
 */

console.log('=================================================');
console.log('  DEVOPS MODULE 01: DOCKER PRACTICE TEST SUITE');
console.log('=================================================');

const dockerfilePath = path.join(__dirname, 'Dockerfile.multistage');
const dockerignorePath = path.join(__dirname, '.dockerignore');

const dockerfileContent = fs.readFileSync(dockerfilePath, 'utf-8');
const dockerignoreContent = fs.readFileSync(dockerignorePath, 'utf-8');

// ----------------------------------------------------------------------------
// CHALLENGE 1: Multi-stage Build Architecture Verification
// ----------------------------------------------------------------------------
function testChallenge1_MultiStageBuild() {
    process.stdout.write('[Test 1] Testing Multi-stage Build Architecture... ');

    const fromLines = dockerfileContent.split('\n').filter(line => line.trim().startsWith('FROM'));
    assert.strictEqual(fromLines.length >= 2, true, 'Dockerfile must contain at least 2 build stages (FROM)');

    const hasBuilderStage = fromLines.some(line => /AS\s+builder/i.test(line));
    const hasRunnerStage = fromLines.some(line => /AS\s+runner/i.test(line));
    assert.strictEqual(hasBuilderStage, true, 'Stage 1 must be aliased with AS builder');
    assert.strictEqual(hasRunnerStage, true, 'Stage 2 must be aliased with AS runner');

    // Verify COPY --from=builder is used in runner stage
    const hasCopyFrom = /COPY\s+--from=builder/i.test(dockerfileContent);
    assert.strictEqual(hasCopyFrom, true, 'Runner stage must copy artifacts from builder via COPY --from=builder');

    console.log('PASSED');
}

// ----------------------------------------------------------------------------
// CHALLENGE 2: Non-Root Security Enforcement
// ----------------------------------------------------------------------------
function testChallenge2_NonRootSecurity() {
    process.stdout.write('[Test 2] Testing Non-Root Security Enforcement... ');

    const hasUserDirective = /^\s*USER\s+(?!root\b)[a-zA-Z0-9_-]+/m.test(dockerfileContent);
    assert.strictEqual(hasUserDirective, true, 'Dockerfile must declare a non-root USER before CMD/ENTRYPOINT');

    // Verify user/group creation
    const createsUserOrGroup = /adduser|useradd|addgroup|groupadd/i.test(dockerfileContent);
    assert.strictEqual(createsUserOrGroup, true, 'Dockerfile must explicitly create a dedicated non-root user/group');

    // Verify ownership during COPY
    const hasChown = /COPY\s+--from=[^\s]+\s+--chown=/i.test(dockerfileContent);
    assert.strictEqual(hasChown, true, 'Artifacts copied into runtime must specify --chown for non-root user permissions');

    console.log('PASSED');
}

// ----------------------------------------------------------------------------
// CHALLENGE 3: Layer Cache Optimization Pipeline
// ----------------------------------------------------------------------------
function testChallenge3_LayerCacheOptimization() {
    process.stdout.write('[Test 3] Testing Layer Cache Optimization Ordering... ');

    const lines = dockerfileContent.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'));

    const packageCopyIndex = lines.findIndex(l => l.startsWith('COPY') && /package.*json/i.test(l));
    const installIndex = lines.findIndex(l => l.startsWith('RUN') && /(npm\s+(ci|install)|yarn|pnpm)/i.test(l));
    const srcCopyIndex = lines.findIndex(l => l.startsWith('COPY') && /src/i.test(l));

    assert.strictEqual(packageCopyIndex !== -1, true, 'Must copy dependency manifests (package*.json)');
    assert.strictEqual(installIndex !== -1, true, 'Must install dependencies via npm ci / npm install');
    assert.strictEqual(srcCopyIndex !== -1, true, 'Must copy source code');

    // Dependency manifests MUST precede install, which MUST precede source copy
    assert.strictEqual(packageCopyIndex < installIndex, true, 'Package manifest must be copied BEFORE dependency install');
    assert.strictEqual(installIndex < srcCopyIndex, true, 'Dependency install must occur BEFORE application source copy');

    console.log('PASSED');
}

// ----------------------------------------------------------------------------
// CHALLENGE 4: Signal Forwarding & Exec-Form CMD
// ----------------------------------------------------------------------------
function testChallenge4_ExecFormCmd() {
    process.stdout.write('[Test 4] Testing Exec-Form CMD for Proper Signal Forwarding... ');

    const cmdLine = dockerfileContent.split('\n').find(l => l.trim().startsWith('CMD'));
    assert.ok(cmdLine, 'Dockerfile must declare a CMD instruction');

    // Exec form uses JSON array syntax: ["executable", "param1"]
    const isJsonArray = /CMD\s*\[.*\]/.test(cmdLine);
    assert.strictEqual(isJsonArray, true, 'CMD must strictly use Exec Form JSON array ["node", "..."] to avoid PID 1 shell bug');

    // Must not use shell form (e.g. CMD node dist/server.js)
    assert.strictEqual(/CMD\s+node\s+/i.test(cmdLine), false, 'Shell form CMD is prohibited');

    console.log('PASSED');
}

// ----------------------------------------------------------------------------
// CHALLENGE 5: Production .dockerignore Audit
// ----------------------------------------------------------------------------
function testChallenge5_DockerignoreAudit() {
    process.stdout.write('[Test 5] Auditing .dockerignore Exclusions... ');

    const rules = dockerignoreContent
        .split('\n')
        .map(r => r.trim())
        .filter(r => r && !r.startsWith('#'));

    const requiredPatterns = [
        '.git',
        'node_modules',
        '.env',
        'dist',
        'build'
    ];

    for (const pattern of requiredPatterns) {
        const found = rules.some(r => r.includes(pattern));
        assert.strictEqual(found, true, `.dockerignore must explicitly exclude ${pattern}`);
    }

    console.log('PASSED');
}

// Run all test challenges
testChallenge1_MultiStageBuild();
testChallenge2_NonRootSecurity();
testChallenge3_LayerCacheOptimization();
testChallenge4_ExecFormCmd();
testChallenge5_DockerignoreAudit();

console.log('\n\x1b[32m[SUCCESS] All 5 Docker Containerization Challenges Passed! (5/5)\x1b[0m');
