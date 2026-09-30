// Module 07: DevSecOps, Supply Chain & Cloud Security Simulators
import crypto from 'node:crypto';

/**
 * 1. Secret Leak Scanner (Shannon Entropy & Pattern Matching)
 */
export class SecretScanner {
  static calculateShannonEntropy(str) {
    if (!str) return 0;
    const len = str.length;
    const frequencies = new Map();
    for (let i = 0; i < len; i++) {
      const char = str[i];
      frequencies.set(char, (frequencies.get(char) || 0) + 1);
    }
    let entropy = 0;
    for (const count of frequencies.values()) {
      const p = count / len;
      entropy -= p * Math.log2(p);
    }
    return entropy;
  }

  static scan(text) {
    const findings = [];

    // AWS Access Key Pattern
    const awsMatch = text.match(/\b(AKIA[0-9A-Z]{16})\b/);
    if (awsMatch) {
      findings.push({ type: 'AWS_ACCESS_KEY', match: awsMatch[1] });
    }

    // GitHub Personal Access Token Pattern
    const ghMatch = text.match(/\b(ghp_[a-zA-Z0-9]{36})\b/);
    if (ghMatch) {
      findings.push({ type: 'GITHUB_PAT', match: ghMatch[1] });
    }

    // Private Key Header Pattern
    if (text.includes('-----BEGIN PRIVATE KEY-----') || text.includes('-----BEGIN RSA PRIVATE KEY-----')) {
      findings.push({ type: 'PRIVATE_KEY_HEADER', match: 'PEM Private Key Header detected' });
    }

    return findings;
  }
}

/**
 * 2. AWS IMDSv2 Token Negotiator & Hop Limit SSRF Defense
 */
export class IMDSv2Simulator {
  constructor() {
    this.activeTokens = new Map(); // token -> expiresAt
    this.maxHopLimit = 1; // AWS default HttpPutResponseHopLimit = 1
  }

  requestToken(method, headers = {}, hopCount = 1) {
    if (method !== 'PUT') {
      throw new Error('IMDSv2 requires HTTP PUT method for token acquisition');
    }
    if (hopCount > this.maxHopLimit) {
      throw new Error('SSRF Blocked: HttpPutResponseHopLimit exceeded (Proxy/WAF forwarding detected)');
    }
    const ttl = parseInt(headers['x-aws-ec2-metadata-token-ttl-seconds'], 10);
    if (!ttl || ttl <= 0 || ttl > 21600) {
      throw new Error('Invalid or missing TTL header');
    }

    const token = crypto.randomBytes(16).toString('hex');
    this.activeTokens.set(token, Date.now() + ttl * 1000);
    return token;
  }

  getMetadata(token, path, hopCount = 1) {
    if (hopCount > this.maxHopLimit) {
      throw new Error('SSRF Blocked: Hop count exceeded on metadata retrieval');
    }
    if (!token || !this.activeTokens.has(token)) {
      throw new Error('HTTP 401 Unauthorized: Valid IMDSv2 token required');
    }
    if (Date.now() > this.activeTokens.get(token)) {
      this.activeTokens.delete(token);
      throw new Error('HTTP 401 Unauthorized: Token has expired');
    }

    if (path === '/latest/meta-data/iam/security-credentials/app-role') {
      return {
        RoleName: 'app-role',
        AccessKeyId: 'ASIAEXAMPLE12345',
        SecretAccessKey: 'tempSecretKey998877',
        Token: 'sessionTokenXYZ...'
      };
    }
    return null;
  }
}

/**
 * 3. Envelope Encryption Engine (KMS Master Key + Local AES-GCM DEK)
 */
export class EnvelopeEncryptionEngine {
  constructor(kmsMasterKey) {
    this.kmsMasterKey = kmsMasterKey; // 32 bytes master key
  }

  /**
   * Generates a Data Encryption Key (DEK) and encrypts it with the KMS Master Key
   */
  generateDataKey() {
    const plainDEK = crypto.randomBytes(32); // AES-256 key
    // Encrypt DEK with KMS Master Key
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', this.kmsMasterKey, iv);
    const encryptedDEK = Buffer.concat([cipher.update(plainDEK), cipher.final()]);
    const tag = cipher.getAuthTag();

    return {
      plainDEK, // Returned to app RAM for immediate data encryption, then discarded
      encryptedDEKPayload: {
        encryptedDEK: encryptedDEK.toString('hex'),
        iv: iv.toString('hex'),
        tag: tag.toString('hex')
      }
    };
  }

  /**
   * Decrypts the encrypted DEK using the KMS Master Key
   */
  decryptDataKey(encryptedDEKPayload) {
    const iv = Buffer.from(encryptedDEKPayload.iv, 'hex');
    const tag = Buffer.from(encryptedDEKPayload.tag, 'hex');
    const encryptedDEK = Buffer.from(encryptedDEKPayload.encryptedDEK, 'hex');

    const decipher = crypto.createDecipheriv('aes-256-gcm', this.kmsMasterKey, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(encryptedDEK), decipher.final()]);
  }

  /**
   * Encrypts large data locally using plainDEK
   */
  encryptPayload(plainDEK, data) {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', plainDEK, iv);
    const ciphertext = Buffer.concat([cipher.update(Buffer.from(data, 'utf8')), cipher.final()]);
    const tag = cipher.getAuthTag();

    return {
      ciphertext: ciphertext.toString('hex'),
      iv: iv.toString('hex'),
      tag: tag.toString('hex')
    };
  }
}

/**
 * 4. Kubernetes NetworkPolicy Firewall Evaluator
 */
export class K8sNetworkPolicyEvaluator {
  constructor() {
    this.ingressRules = []; // list of { fromNamespace, toNamespace, port }
  }

  allowIngress({ fromNamespace, toNamespace, port }) {
    this.ingressRules.push({ fromNamespace, toNamespace, port });
  }

  canTrafficFlow(fromNamespace, toNamespace, port) {
    // Default Deny: only explicitly whitelisted paths are permitted
    return this.ingressRules.some(
      rule =>
        rule.fromNamespace === fromNamespace &&
        rule.toNamespace === toNamespace &&
        rule.port === port
    );
  }
}
