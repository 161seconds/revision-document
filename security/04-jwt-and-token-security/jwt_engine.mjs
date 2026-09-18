// Production-Grade JWT Engine with Hardened Algorithm & Invalidation Defenses
import crypto from 'node:crypto';

/**
 * Encodes string/object into Base64URL string
 * @param {string|Object} input
 * @returns {string}
 */
export function base64UrlEncode(input) {
  const str = typeof input === 'object' ? JSON.stringify(input) : String(input);
  return Buffer.from(str, 'utf8').toString('base64url');
}

/**
 * Decodes Base64URL string back to UTF-8 or JSON object
 * @param {string} b64url
 * @returns {*}
 */
export function base64UrlDecode(b64url, parseJson = false) {
  const str = Buffer.from(b64url, 'base64url').toString('utf8');
  return parseJson ? JSON.parse(str) : str;
}

/**
 * Hardened JWT Engine Defending against None Alg & Algorithm Confusion
 */
export class JwtEngine {
  /**
   * Signs a JWT using HMAC-SHA256 (HS256)
   * @param {Object} payload Claims object
   * @param {string} secret Shared secret key
   * @param {Object} header Custom header fields (e.g. kid)
   * @returns {string} Compact JWT token
   */
  static signHs256(payload, secret, header = {}) {
    const fullHeader = { alg: 'HS256', typ: 'JWT', ...header };
    const encodedHeader = base64UrlEncode(fullHeader);
    const encodedPayload = base64UrlEncode(payload);
    const signingInput = `${encodedHeader}.${encodedPayload}`;

    const signature = crypto
      .createHmac('sha256', secret)
      .update(signingInput)
      .digest('base64url');

    return `${signingInput}.${signature}`;
  }

  /**
   * Strictly verifies a JWT against allowed algorithms and cryptographic signature
   * @param {string} token
   * @param {string} secretOrKey
   * @param {Object} options Verification options { allowedAlgorithms: ['HS256'], now: timestamp }
   * @returns {Object} Decoded payload claims
   */
  static verify(token, secretOrKey, options = {}) {
    if (!token || typeof token !== 'string') {
      throw new Error('MalformedTokenException: Token must be a non-empty string');
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('MalformedTokenException: JWT must contain exactly 3 dot-separated segments');
    }

    const [headerB64, payloadB64, signatureB64] = parts;

    // 1. Decode and inspect Header
    let header;
    try {
      header = base64UrlDecode(headerB64, true);
    } catch {
      throw new Error('MalformedTokenException: Header is invalid JSON');
    }

    // 2. CRITICAL DEFENSE: Algorithm Whitelist Check (Defeats None Alg & Algorithm Confusion)
    const allowedAlgorithms = options.allowedAlgorithms || ['HS256'];
    if (!header.alg || !allowedAlgorithms.includes(header.alg)) {
      throw new Error(
        `AlgorithmConfusionException: Algorithm "${header.alg}" is not allowed. Allowed: [${allowedAlgorithms.join(', ')}]`
      );
    }

    // Reject "none" algorithm unconditionally unless explicitly authorized
    if (header.alg.toLowerCase() === 'none') {
      throw new Error('InsecureAlgorithmException: "none" algorithm is forbidden in production');
    }

    // 3. Cryptographic Signature Verification
    const signingInput = `${headerB64}.${payloadB64}`;
    let expectedSignature;

    if (header.alg === 'HS256') {
      expectedSignature = crypto
        .createHmac('sha256', secretOrKey)
        .update(signingInput)
        .digest('base64url');
    } else {
      throw new Error(`UnsupportedAlgorithmException: Implementation currently validates HS256`);
    }

    const bufExpected = Buffer.from(expectedSignature);
    const bufReceived = Buffer.from(signatureB64);

    if (bufExpected.length !== bufReceived.length || !crypto.timingSafeEqual(bufExpected, bufReceived)) {
      throw new Error('InvalidSignatureException: Signature verification failed');
    }

    // 4. Decode Payload & Claims Validation
    let payload;
    try {
      payload = base64UrlDecode(payloadB64, true);
    } catch {
      throw new Error('MalformedTokenException: Payload is invalid JSON');
    }

    const nowSeconds = options.now !== undefined ? options.now : Math.floor(Date.now() / 1000);

    // Validate Expiration (exp)
    if (payload.exp !== undefined) {
      if (typeof payload.exp !== 'number' || nowSeconds >= payload.exp) {
        throw new Error('TokenExpiredException: Token has expired');
      }
    }

    // Validate Not Before (nbf)
    if (payload.nbf !== undefined) {
      if (typeof payload.nbf !== 'number' || nowSeconds < payload.nbf) {
        throw new Error('TokenNotActiveException: Token is not active yet');
      }
    }

    return payload;
  }
}

/**
 * JWKS Key Resolver Simulator
 */
export class JwksKeyResolver {
  constructor() {
    this.keys = new Map(); // kid -> keyMaterial
  }

  registerKey(kid, keyMaterial) {
    this.keys.set(kid, keyMaterial);
  }

  resolveKey(kid) {
    if (!this.keys.has(kid)) {
      throw new Error(`KeyNotFoundException: No registered public key found for kid "${kid}"`);
    }
    return this.keys.get(kid);
  }
}

/**
 * Token Revocation Blacklist Engine (In-Memory / Redis Simulation)
 */
export class TokenBlacklist {
  constructor() {
    this.revokedJtis = new Map(); // jti -> expiresAtMs
  }

  revoke(jti, remainingTtlMs) {
    const expiresAt = Date.now() + remainingTtlMs;
    this.revokedJtis.set(jti, expiresAt);
  }

  isRevoked(jti) {
    if (!this.revokedJtis.has(jti)) return false;

    const expiresAt = this.revokedJtis.get(jti);
    if (Date.now() > expiresAt) {
      // Memory cleanup: token already naturally expired, remove from blacklist
      this.revokedJtis.delete(jti);
      return false;
    }

    return true;
  }
}
