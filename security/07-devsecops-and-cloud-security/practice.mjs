// Automated Verification Test Suite for Module 07: DevSecOps, Supply Chain & Cloud Security
import assert from 'node:assert';
import crypto from 'node:crypto';
import {
  SecretScanner,
  IMDSv2Simulator,
  EnvelopeEncryptionEngine,
  K8sNetworkPolicyEvaluator
} from './cloud_devsecops.mjs';

console.log('=============================================================');
console.log('WEB SECURITY MODULE 07: CLOUD & DEVSECOPS TEST SUITE');
console.log('=============================================================\n');

// Test 1: Secret Scanner (Pattern Matching & Shannon Entropy)
console.log('[Test 1] Testing Automated Secret Scanning (AWS, GitHub PAT, PEM Keys)...');
const sampleCode = `
const AWS_KEY = "AKIAIOSFODNN7EXAMPLE";
const GITHUB_TOKEN = "ghp_1234567890abcdefghijklmnopqrstuvwxyz";
// DB Config
`;
const findings = SecretScanner.scan(sampleCode);
console.log('  -> Detected Secrets:', findings.map(f => `${f.type}: ${f.match}`));

assert.strictEqual(findings.length, 2);
assert.strictEqual(findings[0].type, 'AWS_ACCESS_KEY');
assert.strictEqual(findings[1].type, 'GITHUB_PAT');
console.log('  -> [PASSED] Secret scanner accurately identifies dangerous credential patterns.\n');

// Test 2: Shannon Entropy Mathematical Distinction
console.log('[Test 2] Testing Shannon Entropy (Natural Text vs Cryptographic Keys)...');
const naturalText = 'this is a regular english sentence without any secret credentials';
const cryptoSecret = crypto.randomBytes(32).toString('base64');

const entropyLow = SecretScanner.calculateShannonEntropy(naturalText);
const entropyHigh = SecretScanner.calculateShannonEntropy(cryptoSecret);

console.log(`  -> Natural Text Entropy:  ${entropyLow.toFixed(2)} bits`);
console.log(`  -> Random Secret Entropy: ${entropyHigh.toFixed(2)} bits`);

assert.ok(entropyLow < 4.0, 'Natural text must have low entropy');
assert.ok(entropyHigh > 4.5, 'Cryptographic keys must exhibit high Shannon entropy');
console.log('  -> [PASSED] Shannon entropy distinguishes human language from encrypted secrets.\n');

// Test 3: AWS IMDSv2 Token Negotiation & Hop Limit SSRF Defense
console.log('[Test 3] Testing AWS IMDSv2 Token Flow & Hop Limit Neutralization...');
const imds = new IMDSv2Simulator();

// Attack attempt: Calling IMDS with HTTP GET (IMDSv1 style SSRF)
assert.throws(() => {
  imds.requestToken('GET', { 'x-aws-ec2-metadata-token-ttl-seconds': '21600' });
}, /requires HTTP PUT method/);

// Legitimate request: HTTP PUT with TTL
const validToken = imds.requestToken('PUT', { 'x-aws-ec2-metadata-token-ttl-seconds': '21600' });
assert.ok(validToken.length > 10);

// Attack attempt: Attacker attempts SSRF via WAF proxy (hop count = 2 > maxHopLimit 1)
assert.throws(() => {
  imds.getMetadata(validToken, '/latest/meta-data/iam/security-credentials/app-role', 2);
}, /HttpPutResponseHopLimit exceeded|Hop count exceeded/);

// Legitimate fetch from local EC2 host (hop count = 1)
const creds = imds.getMetadata(validToken, '/latest/meta-data/iam/security-credentials/app-role', 1);
assert.strictEqual(creds.RoleName, 'app-role');
assert.strictEqual(creds.AccessKeyId, 'ASIAEXAMPLE12345');
console.log('  -> [PASSED] IMDSv2 strictly repels GET-based SSRF and hop-forwarded proxy exploitation.\n');

// Test 4: Envelope Encryption (KMS Master Key + Local DEK)
console.log('[Test 4] Testing KMS Envelope Encryption & Decryption Round-Trip...');
const kmsMasterKey = crypto.randomBytes(32);
const engine = new EnvelopeEncryptionEngine(kmsMasterKey);

// 1. Generate DEK
const { plainDEK, encryptedDEKPayload } = engine.generateDataKey();

// 2. Encrypt large data locally
const sensitiveCustomerData = JSON.stringify({ ssn: '000-12-3456', creditCard: '4111222233334444' });
const encryptedData = engine.encryptPayload(plainDEK, sensitiveCustomerData);

// 3. Discard plainDEK from RAM to simulate end of write operation
// 4. Later: Decrypt DEK using KMS Master Key and recover original data
const recoveredDEK = engine.decryptDataKey(encryptedDEKPayload);
assert.deepStrictEqual(recoveredDEK, plainDEK, 'Recovered DEK must match original generated key');

const decipher = crypto.createDecipheriv('aes-256-gcm', recoveredDEK, Buffer.from(encryptedData.iv, 'hex'));
decipher.setAuthTag(Buffer.from(encryptedData.tag, 'hex'));
const decryptedPlaintext = Buffer.concat([
  decipher.update(Buffer.from(encryptedData.ciphertext, 'hex')),
  decipher.final()
]).toString('utf8');

assert.strictEqual(decryptedPlaintext, sensitiveCustomerData);
console.log('  -> [PASSED] Envelope encryption securely decouples master key operations from bulk payload encryption.\n');

// Test 5: Kubernetes NetworkPolicy Default-Deny Firewall
console.log('[Test 5] Testing Kubernetes NetworkPolicy Ingress Rules & Default-Deny...');
const k8sNet = new K8sNetworkPolicyEvaluator();

// Allow: frontend -> backend on port 8080
k8sNet.allowIngress({ fromNamespace: 'frontend', toNamespace: 'backend', port: 8080 });

// Allowed connection
assert.strictEqual(k8sNet.canTrafficFlow('frontend', 'backend', 8080), true);

// Blocked: unauthorized port (9090)
assert.strictEqual(k8sNet.canTrafficFlow('frontend', 'backend', 9090), false);

// Blocked: unauthorized source (guest-wifi -> backend)
assert.strictEqual(k8sNet.canTrafficFlow('guest-wifi', 'backend', 8080), false);
console.log('  -> [PASSED] Kubernetes NetworkPolicy enforces strict microsegmentation and default-deny.\n');

console.log('=============================================================');
console.log('ALL 5 WEB SECURITY MODULE 07 TESTS PASSED SUCCESSFULLY! (5/5)');
console.log('=============================================================');
