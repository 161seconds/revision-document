// Module 08: Threat Modeling, Defense-in-Depth & Incident Response Engines
import crypto from 'node:crypto';

/**
 * 1. DREAD Risk Rating Calculator
 */
export class DREADRiskCalculator {
  static calculate({ damage, reproducibility, exploitability, affectedUsers, discoverability }) {
    const values = [damage, reproducibility, exploitability, affectedUsers, discoverability];
    for (const val of values) {
      if (typeof val !== 'number' || val < 1 || val > 10) {
        throw new Error('All DREAD criteria must be integers between 1 and 10');
      }
    }

    const score = parseFloat((values.reduce((sum, v) => sum + v, 0) / 5).toFixed(2));
    let severity = 'LOW';
    if (score >= 8.0) severity = 'CRITICAL';
    else if (score >= 6.0) severity = 'HIGH';
    else if (score >= 4.0) severity = 'MEDIUM';

    return { score, severity };
  }
}

/**
 * 2. Nonce-Based Modern CSP Generator & Validator
 */
export class NonceCSPManager {
  static generateNonce() {
    return crypto.randomBytes(16).toString('base64');
  }

  static buildHeader(nonce) {
    return `default-src 'self'; script-src 'self' 'nonce-${nonce}' 'strict-dynamic'; object-src 'none'; base-uri 'none'; frame-ancestors 'none';`;
  }

  static validateScript(scriptHtml, currentNonce) {
    const match = scriptHtml.match(/<script\s+[^>]*nonce=["']([^"']+)["'][^>]*>/i);
    if (!match) return false;
    const providedNonce = match[1];

    const bufA = Buffer.from(providedNonce);
    const bufB = Buffer.from(currentNonce);
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  }
}

/**
 * 3. Tamper-Evident Audit Log with Cryptographic Hash Chaining
 */
export class HashChainedAuditLog {
  constructor() {
    this.chain = [];
    this.genesisHash = '0000000000000000000000000000000000000000000000000000000000000000';
  }

  append({ actor, action, payload }) {
    const previousHash = this.chain.length === 0 ? this.genesisHash : this.chain[this.chain.length - 1].hash;
    const timestamp = Date.now();
    const dataToHash = `${previousHash}|${timestamp}|${actor}|${action}|${JSON.stringify(payload)}`;
    const hash = crypto.createHash('sha256').update(dataToHash).digest('hex');

    const entry = {
      index: this.chain.length,
      timestamp,
      actor,
      action,
      payload,
      previousHash,
      hash
    };
    this.chain.push(entry);
    return entry;
  }

  verifyIntegrity() {
    for (let i = 0; i < this.chain.length; i++) {
      const entry = this.chain[i];
      const expectedPrevHash = i === 0 ? this.genesisHash : this.chain[i - 1].hash;

      if (entry.previousHash !== expectedPrevHash) {
        return { isValid: false, tamperedIndex: i, reason: 'Broken previousHash chain linkage' };
      }

      const dataToHash = `${entry.previousHash}|${entry.timestamp}|${entry.actor}|${entry.action}|${JSON.stringify(entry.payload)}`;
      const recomputedHash = crypto.createHash('sha256').update(dataToHash).digest('hex');

      if (entry.hash !== recomputedHash) {
        return { isValid: false, tamperedIndex: i, reason: 'Tampered entry contents detected via hash mismatch' };
      }
    }
    return { isValid: true, tamperedIndex: -1, totalEntries: this.chain.length };
  }
}

/**
 * 4. Slowloris L7 Connection Exhaustion Detector
 */
export class SlowlorisDetector {
  constructor(headerTimeoutMs = 5000, minBytesRequired = 50) {
    this.headerTimeoutMs = headerTimeoutMs;
    this.minBytesRequired = minBytesRequired;
  }

  inspectConnection({ socketOpenDurationMs, bytesReceived, headersCompleted }) {
    if (headersCompleted) return { isSlowloris: false, action: 'ALLOW' };

    if (socketOpenDurationMs > this.headerTimeoutMs && bytesReceived < this.minBytesRequired) {
      return {
        isSlowloris: true,
        action: 'TERMINATE_SOCKET',
        reason: 'Client holding socket open with drip-feed headers'
      };
    }
    return { isSlowloris: false, action: 'WAIT' };
  }
}

/**
 * 5. CVSS v3.1 Base Score Calculator (Simplified Standard Implementation)
 */
export class CVSSCalculator {
  static calculateBase({ attackVector = 'NETWORK', complexity = 'LOW', privileges = 'NONE', userInteraction = 'NONE', impact = 'HIGH' }) {
    let av = 0.85;
    if (attackVector === 'LOCAL') av = 0.55;
    if (attackVector === 'PHYSICAL') av = 0.20;

    const ac = complexity === 'LOW' ? 0.77 : 0.44;
    const pr = privileges === 'NONE' ? 0.85 : (privileges === 'LOW' ? 0.62 : 0.27);
    const ui = userInteraction === 'NONE' ? 0.85 : 0.62;

    const exploitability = 8.22 * av * ac * pr * ui;
    const impactVal = impact === 'HIGH' ? 5.9 : (impact === 'LOW' ? 3.9 : 0);

    const baseScore = parseFloat(Math.min(10.0, exploitability + impactVal).toFixed(1));
    let severity = 'NONE';
    if (baseScore >= 9.0) severity = 'CRITICAL';
    else if (baseScore >= 7.0) severity = 'HIGH';
    else if (baseScore >= 4.0) severity = 'MEDIUM';
    else if (baseScore > 0) severity = 'LOW';

    return { baseScore, severity };
  }
}
