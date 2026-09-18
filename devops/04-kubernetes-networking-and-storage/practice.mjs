import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * ============================================================================
 * DEVOPS MODULE 04: NETWORKING & STORAGE - SELF-TEST PRACTICE SUITE
 * ============================================================================
 * Chạy trực tiếp qua Node.js:
 * rtk node devops/04-kubernetes-networking-and-storage/practice.mjs
 *
 * Yêu cầu: Tất cả 5 Thử thách phải vượt qua mọi assert mà không có Exception.
 */

console.log('=================================================');
console.log('  DEVOPS MODULE 04: NETWORKING & STORAGE TEST');
console.log('=================================================');

const manifestPath = path.join(__dirname, 'networking-and-storage.yaml');
const rawContent = fs.readFileSync(manifestPath, 'utf-8');

// Parse multiple YAML documents split by '---'
const docs = rawContent
    .split(/^---$/m)
    .map(doc => doc.trim())
    .filter(doc => doc.length > 0);

// ----------------------------------------------------------------------------
// CHALLENGE 1: Multi-Document Manifest Parsing & Resource Verification
// ----------------------------------------------------------------------------
function testChallenge1_MultiDocumentStructure() {
    process.stdout.write('[Test 1] Testing Multi-Document YAML Structure... ');

    assert.strictEqual(docs.length, 5, 'Manifest must contain exactly 5 Kubernetes resources');

    const kinds = docs.map(doc => {
        const match = doc.match(/kind:\s*([a-zA-Z0-9]+)/);
        return match ? match[1] : null;
    });

    assert.ok(kinds.includes('ConfigMap'), 'Must define ConfigMap');
    assert.ok(kinds.includes('Secret'), 'Must define Secret');
    assert.ok(kinds.includes('PersistentVolumeClaim'), 'Must define PersistentVolumeClaim');
    assert.ok(kinds.includes('Service'), 'Must define Service');
    assert.ok(kinds.includes('Ingress'), 'Must define Ingress');

    console.log('PASSED');
}

// ----------------------------------------------------------------------------
// CHALLENGE 2: Service Discovery & ClusterIP TargetPort Mapping
// ----------------------------------------------------------------------------
function testChallenge2_ServiceDiscovery() {
    process.stdout.write('[Test 2] Testing Service Discovery & TargetPort Mapping... ');

    const serviceDoc = docs.find(d => d.includes('kind: Service'));
    assert.ok(serviceDoc, 'Service document must exist');

    assert.strictEqual(/type:\s*ClusterIP/m.test(serviceDoc), true, 'Service type must be ClusterIP');
    assert.strictEqual(/port:\s*80/m.test(serviceDoc), true, 'Service listening port must be 80');
    assert.strictEqual(/targetPort:\s*8080/m.test(serviceDoc), true, 'Service targetPort must be 8080');

    // Selector verification
    assert.strictEqual(/app\.kubernetes\.io\/name:\s*order-api/.test(serviceDoc), true, 'Service selector must match order-api');

    console.log('PASSED');
}

// ----------------------------------------------------------------------------
// CHALLENGE 3: Ingress Layer 7 Routing & SSL/TLS Termination
// ----------------------------------------------------------------------------
function testChallenge3_IngressLayer7Routing() {
    process.stdout.write('[Test 3] Testing Ingress Layer 7 Routing & TLS Termination... ');

    const ingressDoc = docs.find(d => d.includes('kind: Ingress'));
    assert.ok(ingressDoc, 'Ingress document must exist');

    assert.strictEqual(/apiVersion:\s*networking\.k8s\.io\/v1/.test(ingressDoc), true, 'Ingress must use networking.k8s.io/v1');
    assert.strictEqual(/ingressClassName:\s*nginx/.test(ingressDoc), true, 'Must declare modern ingressClassName: nginx');

    // Routing path
    assert.strictEqual(/path:\s*\/api\/v1/.test(ingressDoc), true, 'Must route path /api/v1');
    assert.strictEqual(/pathType:\s*Prefix/.test(ingressDoc), true, 'Must use pathType: Prefix for REST routing');

    // TLS verification
    assert.strictEqual(/secretName:\s*api-tls-cert/.test(ingressDoc), true, 'Must bind TLS secret api-tls-cert');
    assert.strictEqual(/host:\s*api\.example\.com/.test(ingressDoc), true, 'Must route for host api.example.com');

    console.log('PASSED');
}

// ----------------------------------------------------------------------------
// CHALLENGE 4: PersistentVolumeClaim Storage Allocation
// ----------------------------------------------------------------------------
function testChallenge4_StorageClaim() {
    process.stdout.write('[Test 4] Testing PersistentVolumeClaim & Access Modes... ');

    const pvcDoc = docs.find(d => d.includes('kind: PersistentVolumeClaim'));
    assert.ok(pvcDoc, 'PVC document must exist');

    assert.strictEqual(/accessModes:\s*\n\s*-\s*ReadWriteOnce/.test(pvcDoc), true, 'PVC must request ReadWriteOnce access mode');
    assert.strictEqual(/storage:\s*10Gi/.test(pvcDoc), true, 'PVC must request 10Gi storage capacity');
    assert.strictEqual(/storageClassName:\s*standard-rwo/.test(pvcDoc), true, 'PVC must specify storageClassName for Dynamic Provisioning');

    console.log('PASSED');
}

// ----------------------------------------------------------------------------
// CHALLENGE 5: ConfigMap & Base64 Secret Cryptographic Integrity
// ----------------------------------------------------------------------------
function testChallenge5_ConfigAndSecretIntegrity() {
    process.stdout.write('[Test 5] Testing ConfigMap & Secret Base64 Decoding... ');

    const secretDoc = docs.find(d => d.includes('kind: Secret'));
    assert.ok(secretDoc, 'Secret document must exist');

    assert.strictEqual(/type:\s*Opaque/.test(secretDoc), true, 'Secret type must be Opaque');

    // Decode and verify Base64 values
    const dbMatch = secretDoc.match(/DATABASE_URL:\s*"([^"]+)"/);
    assert.ok(dbMatch, 'Must contain DATABASE_URL in Secret');
    const decodedDb = Buffer.from(dbMatch[1], 'base64').toString('utf-8');
    assert.strictEqual(decodedDb.startsWith('postgresql://'), true, 'Decoded DATABASE_URL must start with postgresql://');

    const jwtMatch = secretDoc.match(/JWT_SECRET:\s*"([^"]+)"/);
    assert.ok(jwtMatch, 'Must contain JWT_SECRET in Secret');
    const decodedJwt = Buffer.from(jwtMatch[1], 'base64').toString('utf-8');
    assert.strictEqual(decodedJwt, 'JWT_SUPER_SECRET_KEY_9988', 'Decoded JWT_SECRET must match expected secret key');

    console.log('PASSED');
}

// Execute all test challenges
testChallenge1_MultiDocumentStructure();
testChallenge2_ServiceDiscovery();
testChallenge3_IngressLayer7Routing();
testChallenge4_StorageClaim();
testChallenge5_ConfigAndSecretIntegrity();

console.log('\n\x1b[32m[SUCCESS] All 5 Kubernetes Networking & Storage Challenges Passed! (5/5)\x1b[0m');
