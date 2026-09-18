import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * ============================================================================
 * DEVOPS MODULE 02: DOCKER COMPOSE & ORCHESTRATION - SELF-TEST PRACTICE SUITE
 * ============================================================================
 * Chạy trực tiếp qua Node.js:
 * rtk node devops/02-docker-compose-and-orchestration/practice.mjs
 *
 * Yêu cầu: Tất cả 5 Thử thách phải vượt qua mọi assert mà không có Exception.
 */

console.log('=================================================');
console.log('  DEVOPS MODULE 02: COMPOSE TEST SUITE');
console.log('=================================================');

const composePath = path.join(__dirname, 'docker-compose.yml');
const composeContent = fs.readFileSync(composePath, 'utf-8');

// ----------------------------------------------------------------------------
// CHALLENGE 1: Service Architecture & Hierarchy Verification
// ----------------------------------------------------------------------------
function testChallenge1_ServiceArchitecture() {
    process.stdout.write('[Test 1] Testing Microservices Architecture Hierarchy... ');

    const requiredServices = ['gateway:', 'api:', 'database:', 'cache:'];
    for (const service of requiredServices) {
        assert.strictEqual(
            composeContent.includes(service),
            true,
            `docker-compose.yml must define ${service}`
        );
    }

    assert.strictEqual(composeContent.includes("version: '3.8'"), true, 'Must declare Compose file version 3.8');

    console.log('PASSED');
}

// ----------------------------------------------------------------------------
// CHALLENGE 2: Dependency Synchronization with Healthchecks
// ----------------------------------------------------------------------------
function testChallenge2_HealthcheckDependencies() {
    process.stdout.write('[Test 2] Testing Healthcheck Dependencies & Startup Synchronization... ');

    // Verify condition: service_healthy is used for database and cache
    assert.strictEqual(
        composeContent.includes('condition: service_healthy'),
        true,
        'API must use condition: service_healthy for backend dependencies'
    );

    // Verify healthcheck commands exist
    assert.strictEqual(
        composeContent.includes('pg_isready'),
        true,
        'Database must implement pg_isready healthcheck'
    );
    assert.strictEqual(
        composeContent.includes('redis-cli') && composeContent.includes('ping'),
        true,
        'Cache must implement redis-cli ping healthcheck'
    );

    console.log('PASSED');
}

// ----------------------------------------------------------------------------
// CHALLENGE 3: Multi-tier Network Segmentation & DMZ Isolation
// ----------------------------------------------------------------------------
function testChallenge3_NetworkIsolation() {
    process.stdout.write('[Test 3] Testing Multi-tier Network Segmentation & Isolation... ');

    assert.strictEqual(composeContent.includes('frontend-net:'), true, 'Must define frontend-net');
    assert.strictEqual(composeContent.includes('backend-net:'), true, 'Must define backend-net');

    // Split top-level services accurately by matching indentation / service header
    const gatewayChunk = composeContent.split(/\n\s{2}gateway:\s*\n/)[1].split(/\n\s{2}api:\s*\n/)[0];
    const apiChunk = composeContent.split(/\n\s{2}api:\s*\n/)[1].split(/\n\s{2}database:\s*\n/)[0];
    const dbChunk = composeContent.split(/\n\s{2}database:\s*\n/)[1].split(/\n\s{2}cache:\s*\n/)[0];

    assert.strictEqual(gatewayChunk.includes('frontend-net'), true, 'Gateway must be in frontend-net');
    assert.strictEqual(gatewayChunk.includes('backend-net'), false, 'Gateway MUST NOT be in backend-net (DMZ isolation)');

    assert.strictEqual(dbChunk.includes('backend-net'), true, 'Database must be in backend-net');
    assert.strictEqual(dbChunk.includes('frontend-net'), false, 'Database MUST NOT be in frontend-net');

    assert.strictEqual(apiChunk.includes('frontend-net'), true, 'API must connect to frontend-net');
    assert.strictEqual(apiChunk.includes('backend-net'), true, 'API must connect to backend-net');

    console.log('PASSED');
}

// ----------------------------------------------------------------------------
// CHALLENGE 4: Port Exposure Security (Least Privilege)
// ----------------------------------------------------------------------------
function testChallenge4_PortExposureSecurity() {
    process.stdout.write('[Test 4] Testing Port Exposure Security (No Public DB Ports)... ');

    const apiChunk = composeContent.split(/\n\s{2}api:\s*\n/)[1].split(/\n\s{2}database:\s*\n/)[0];
    const dbChunk = composeContent.split(/\n\s{2}database:\s*\n/)[1].split(/\n\s{2}cache:\s*\n/)[0];
    const cacheChunk = composeContent.split(/\n\s{2}cache:\s*\n/)[1].split(/\nnetworks:\s*\n/)[0];

    // Database and Cache must not have public 'ports:' declaration
    assert.strictEqual(
        dbChunk.includes('ports:'),
        false,
        'Database must NEVER publish public ports to the host!'
    );
    assert.strictEqual(
        cacheChunk.includes('ports:'),
        false,
        'Cache must NEVER publish public ports to the host!'
    );

    // API should only use expose, not public ports (gateway handles ingress)
    assert.strictEqual(apiChunk.includes('expose:'), true, 'API should use internal expose');
    assert.strictEqual(apiChunk.includes('ports:'), false, 'API does not publish public ports directly');

    console.log('PASSED');
}

// ----------------------------------------------------------------------------
// CHALLENGE 5: Data Persistence & Environment Safety
// ----------------------------------------------------------------------------
function testChallenge5_PersistenceAndEnvSafety() {
    process.stdout.write('[Test 5] Testing Volume Persistence & Mandatory Env Checks... ');

    // Verify named volume
    assert.strictEqual(composeContent.includes('volumes:'), true, 'Must declare top-level volumes');
    assert.strictEqual(composeContent.includes('pg_data:'), true, 'Must declare pg_data named volume');

    // Verify required password syntax ${POSTGRES_PASSWORD:?
    assert.strictEqual(
        composeContent.includes('${POSTGRES_PASSWORD:?'),
        true,
        'Database password must use fail-fast validation syntax ${POSTGRES_PASSWORD:?...}'
    );

    console.log('PASSED');
}

// Execute all test challenges
testChallenge1_ServiceArchitecture();
testChallenge2_HealthcheckDependencies();
testChallenge3_NetworkIsolation();
testChallenge4_PortExposureSecurity();
testChallenge5_PersistenceAndEnvSafety();

console.log('\n\x1b[32m[SUCCESS] All 5 Docker Compose Orchestration Challenges Passed! (5/5)\x1b[0m');
