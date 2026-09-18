// Production-Grade OAuth 2.0 PKCE, OIDC & Token Rotation Engine
import crypto from 'node:crypto';

/**
 * Proof Key for Code Exchange (PKCE - RFC 7636) Engine
 */
export class PkceEngine {
  /**
   * Generates a high-entropy code_verifier and its SHA-256 S256 code_challenge
   * @returns {{ code_verifier: string, code_challenge: string }}
   */
  static generatePair() {
    // 64-byte random buffer -> 86 Base64Url characters (within 43-128 range)
    const code_verifier = crypto.randomBytes(64).toString('base64url');

    // S256: BASE64URL(SHA256(code_verifier))
    const hash = crypto.createHash('sha256').update(code_verifier).digest();
    const code_challenge = hash.toString('base64url');

    return { code_verifier, code_challenge };
  }

  /**
   * Verifies that code_verifier matches the original code_challenge
   * @param {string} codeVerifier
   * @param {string} expectedChallenge
   * @returns {boolean}
   */
  static verify(codeVerifier, expectedChallenge) {
    if (!codeVerifier || !expectedChallenge) return false;

    const hash = crypto.createHash('sha256').update(codeVerifier).digest();
    const computedChallenge = hash.toString('base64url');

    const bufComputed = Buffer.from(computedChallenge);
    const bufExpected = Buffer.from(expectedChallenge);

    if (bufComputed.length !== bufExpected.length) return false;
    return crypto.timingSafeEqual(bufComputed, bufExpected);
  }
}

/**
 * OIDC ID Token Claims Validator
 */
export class OidcClaimsValidator {
  /**
   * Validates standard OpenID Connect ID Token claims
   * @param {Object} claims Decoded JWT payload claims
   * @param {Object} expected Expected configuration { issuer, audience, nonce }
   * @param {number} now Current Unix timestamp in seconds
   * @returns {{ valid: boolean, error?: string }}
   */
  static validate(claims, expected, now = Math.floor(Date.now() / 1000)) {
    if (!claims || typeof claims !== 'object') {
      return { valid: false, error: 'Claims must be an object' };
    }

    // 1. Validate Subject ID presence
    if (!claims.sub || typeof claims.sub !== 'string') {
      return { valid: false, error: 'Missing or invalid "sub" (Subject) claim' };
    }

    // 2. Validate Issuer (iss)
    if (claims.iss !== expected.issuer) {
      return { valid: false, error: `Issuer mismatch: expected ${expected.issuer}, got ${claims.iss}` };
    }

    // 3. Validate Audience (aud)
    if (claims.aud !== expected.audience) {
      return { valid: false, error: `Audience mismatch: expected ${expected.audience}, got ${claims.aud}` };
    }

    // 4. Validate Expiration (exp)
    if (typeof claims.exp !== 'number' || now >= claims.exp) {
      return { valid: false, error: 'Token has expired' };
    }

    // 5. Validate Nonce if expected
    if (expected.nonce && claims.nonce !== expected.nonce) {
      return { valid: false, error: 'Nonce mismatch: replay or CSRF suspected' };
    }

    return { valid: true };
  }
}

/**
 * Refresh Token Rotation (RTR) & Fraud Detection Manager
 */
export class RefreshTokenRotationManager {
  constructor() {
    // familyId -> { activeToken, revokedTokens: Set<string>, compromised: boolean }
    this.families = new Map();
  }

  /**
   * Issues initial token pair for a new login session
   * @param {string} familyId
   * @returns {string} Initial Refresh Token
   */
  issueInitialToken(familyId) {
    const initialToken = `rt_${crypto.randomBytes(32).toString('hex')}`;
    this.families.set(familyId, {
      activeToken: initialToken,
      revokedTokens: new Set(),
      compromised: false,
    });
    return initialToken;
  }

  /**
   * Rotates refresh token upon presentation. Detects replay and revokes family if reused.
   * @param {string} familyId
   * @param {string} presentedToken
   * @returns {{ success: boolean, newRefreshToken?: string, error?: string }}
   */
  rotate(familyId, presentedToken) {
    const family = this.families.get(familyId);
    if (!family) {
      return { success: false, error: 'InvalidTokenFamily: Session does not exist' };
    }

    if (family.compromised) {
      return { success: false, error: 'CompromisedFamily: Session permanently revoked due to prior fraud' };
    }

    // Fraud Detection: Presented token was already revoked / used previously!
    if (family.revokedTokens.has(presentedToken)) {
      family.compromised = true;
      family.activeToken = null;
      family.revokedTokens.clear();
      return {
        success: false,
        error: 'TokenReuseDetected: Attempted replay of used refresh token. Entire family revoked!',
      };
    }

    // Valid active token presented
    if (family.activeToken === presentedToken) {
      // Retire current token
      family.revokedTokens.add(presentedToken);

      // Issue new single-use refresh token
      const newToken = `rt_${crypto.randomBytes(32).toString('hex')}`;
      family.activeToken = newToken;

      return { success: true, newRefreshToken: newToken };
    }

    return { success: false, error: 'InvalidToken: Token mismatch' };
  }

  isFamilyActive(familyId) {
    const family = this.families.get(familyId);
    return Boolean(family && !family.compromised && family.activeToken !== null);
  }
}

/**
 * Strict Redirect URI Validator to defeat Poisoning Attacks
 */
export class RedirectUriValidator {
  /**
   * Enforces exact string matching for OAuth Redirect URIs
   * @param {string} requestedUri
   * @param {string[]} registeredUris
   * @returns {boolean}
   */
  static isAllowed(requestedUri, registeredUris) {
    if (!requestedUri || !Array.isArray(registeredUris)) return false;

    // Strict exact equality (No wildcards, no prefix matching)
    return registeredUris.includes(requestedUri);
  }
}
