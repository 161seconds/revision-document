// Production-Grade Authentication, Session & MFA Algorithms
import crypto from 'node:crypto';

const BASE32_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

/**
 * Base32 Decoder for TOTP Secrets (RFC 3548 / RFC 6238)
 * @param {string} base32
 * @returns {Buffer}
 */
export function base32Decode(base32) {
  const clean = base32.toUpperCase().replace(/[=\s]/g, '');
  let bits = 0;
  let value = 0;
  const bytes = [];

  for (let i = 0; i < clean.length; i++) {
    const idx = BASE32_CHARS.indexOf(clean[i]);
    if (idx === -1) throw new Error(`Invalid Base32 character: ${clean[i]}`);

    value = (value << 5) | idx;
    bits += 5;

    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return Buffer.from(bytes);
}

/**
 * RFC 6238 Time-based One-Time Password (TOTP) Implementation
 */
export class TotpEngine {
  /**
   * Generates a 6-digit TOTP code for a given timestamp
   * @param {string} secretBase32 Base32 encoded shared secret
   * @param {number} timestampMs Unix timestamp in milliseconds
   * @param {number} timeStepSeconds Interval in seconds (default: 30)
   * @returns {string} 6-digit numeric string
   */
  static generateToken(secretBase32, timestampMs = Date.now(), timeStepSeconds = 30) {
    const key = base32Decode(secretBase32);
    const counter = Math.floor(timestampMs / 1000 / timeStepSeconds);

    // 8-byte big-endian counter buffer
    const counterBuffer = Buffer.alloc(8);
    counterBuffer.writeBigUInt64BE(BigInt(counter));

    // Compute HMAC-SHA1
    const hmac = crypto.createHmac('sha1', key).update(counterBuffer).digest();

    // Dynamic Truncation
    const offset = hmac[hmac.length - 1] & 0x0f;
    const binaryCode =
      ((hmac[offset] & 0x7f) << 24) |
      ((hmac[offset + 1] & 0xff) << 16) |
      ((hmac[offset + 2] & 0xff) << 8) |
      (hmac[offset + 3] & 0xff);

    const otp = binaryCode % 1000000;
    return String(otp).padStart(6, '0');
  }

  /**
   * Verifies TOTP token accounting for clock drift
   * @param {string} token
   * @param {string} secretBase32
   * @param {number} window Number of adjacent steps to check (default: 1 step = +/- 30s)
   * @param {number} timestampMs
   * @returns {boolean}
   */
  static verifyToken(token, secretBase32, window = 1, timestampMs = Date.now()) {
    if (!token || token.length !== 6) return false;

    for (let i = -window; i <= window; i++) {
      const stepTime = timestampMs + i * 30000;
      const expectedToken = this.generateToken(secretBase32, stepTime);
      if (crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expectedToken))) {
        return true;
      }
    }
    return false;
  }
}

/**
 * Cookie Security Flags Validator
 */
export class CookieSecurityValidator {
  /**
   * Audits cookie configuration against security best practices
   * @param {Object} options
   * @returns {{ compliant: boolean, warnings: string[] }}
   */
  static auditCookieOptions(options) {
    const warnings = [];

    if (!options.secure) {
      warnings.push('CRITICAL: Cookie must have "Secure" flag enabled (HTTPS only)');
    }

    if (!options.httpOnly) {
      warnings.push('CRITICAL: Cookie must have "HttpOnly" flag enabled to prevent XSS theft');
    }

    const sameSite = (options.sameSite || '').toLowerCase();
    if (sameSite !== 'strict' && sameSite !== 'lax') {
      warnings.push('HIGH: SameSite must be "Strict" or "Lax" to prevent CSRF');
    }

    if (sameSite === 'none' && !options.secure) {
      warnings.push('CRITICAL: SameSite=None requires Secure=true');
    }

    return {
      compliant: warnings.length === 0,
      warnings,
    };
  }
}

/**
 * Exponential Backoff Rate Limiter for Login Protection
 */
export class LoginAttemptTracker {
  constructor() {
    this.attempts = new Map(); // identity -> { failedCount, lastFailedTime }
  }

  recordFailure(identity) {
    const record = this.attempts.get(identity) || { failedCount: 0, lastFailedTime: 0 };
    record.failedCount += 1;
    record.lastFailedTime = Date.now();
    this.attempts.set(identity, record);
  }

  recordSuccess(identity) {
    this.attempts.delete(identity);
  }

  getRequiredDelaySeconds(identity) {
    const record = this.attempts.get(identity);
    if (!record || record.failedCount <= 1) return 0;

    // Exponential backoff: 2^(N-2) seconds for N >= 2
    // e.g. 2 fails -> 1s, 3 fails -> 2s, 4 fails -> 4s, 5 fails -> 8s
    const power = Math.min(record.failedCount - 2, 10); // cap at 2^10 = 1024s
    return Math.pow(2, power);
  }
}

/**
 * Session Regeneration & Fixation Defense Simulator
 */
export class SessionManager {
  constructor() {
    this.sessions = new Map(); // sessionId -> sessionData
  }

  createAnonymousSession() {
    const sessionId = crypto.randomBytes(32).toString('hex');
    this.sessions.set(sessionId, { authenticated: false, createdAt: Date.now() });
    return sessionId;
  }

  /**
   * Regenerates session ID on login to defeat Session Fixation
   * @param {string} oldSessionId
   * @param {Object} userData
   * @returns {string} New Session ID
   */
  regenerateOnLogin(oldSessionId, userData) {
    // Invalidate old session ID
    this.sessions.delete(oldSessionId);

    // Issue brand-new cryptographically secure session ID
    const newSessionId = crypto.randomBytes(32).toString('hex');
    this.sessions.set(newSessionId, {
      ...userData,
      authenticated: true,
      createdAt: Date.now(),
    });

    return newSessionId;
  }

  getSession(sessionId) {
    return this.sessions.get(sessionId);
  }
}
