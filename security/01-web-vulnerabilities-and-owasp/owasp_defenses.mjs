// Production-Grade OWASP Defense Utilities
import crypto from 'node:crypto';
import { URL } from 'node:url';

/**
 * Contextual Output Encoder for XSS Defense
 */
export class HtmlContextualEncoder {
  /**
   * Encodes untrusted strings for insertion into HTML Body
   * @param {string} input
   * @returns {string}
   */
  static encodeHtmlBody(input) {
    if (typeof input !== 'string') return '';
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  }

  /**
   * Encodes untrusted strings for insertion into HTML Attributes
   * @param {string} input
   * @returns {string}
   */
  static encodeHtmlAttribute(input) {
    if (typeof input !== 'string') return '';
    return input.replace(/[^a-zA-Z0-9.\-_]/g, (char) => {
      return `&#x${char.charCodeAt(0).toString(16)};`;
    });
  }
}

/**
 * SSRF Defense: Validates URLs against Localhost, RFC 1918 Private Ranges & Cloud Metadata
 */
export class SsrfUrlValidator {
  /**
   * Checks if an IPv4 address belongs to private or link-local ranges
   * @param {string} ip
   * @returns {boolean} True if IP is internal/private
   */
  static isPrivateOrReservedIp(ip) {
    const parts = ip.split('.').map(Number);
    if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255)) {
      return false;
    }

    const [a, b] = parts;

    // 127.0.0.0/8 (Loopback)
    if (a === 127) return true;
    // 0.0.0.0/8
    if (a === 0) return true;
    // 10.0.0.0/8 (RFC 1918 Private)
    if (a === 10) return true;
    // 172.16.0.0/12 (RFC 1918 Private)
    if (a === 172 && b >= 16 && b <= 31) return true;
    // 192.168.0.0/16 (RFC 1918 Private)
    if (a === 192 && b === 168) return true;
    // 169.254.0.0/16 (Link-Local & Cloud Metadata 169.254.169.254)
    if (a === 169 && b === 254) return true;

    return false;
  }

  /**
   * Validates target URL against SSRF threats
   * @param {string} urlString
   * @returns {{ safe: boolean, reason?: string }}
   */
  static validateUrl(urlString) {
    let parsed;
    try {
      parsed = new URL(urlString);
    } catch {
      return { safe: false, reason: 'Malformed URL' };
    }

    // Must be HTTP or HTTPS
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { safe: false, reason: 'Unsupported protocol (only http/https permitted)' };
    }

    const hostname = parsed.hostname.toLowerCase();

    // Check loopback hostnames
    if (hostname === 'localhost' || hostname === '::1' || hostname === '[::1]') {
      return { safe: false, reason: 'Loopback target forbidden' };
    }

    // Direct IP address check
    if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
      if (this.isPrivateOrReservedIp(hostname)) {
        return { safe: false, reason: 'Private/Link-Local IP address blocked' };
      }
    }

    return { safe: true };
  }
}

/**
 * CSRF Protection with HMAC-SHA256 Timing-Safe Synchronizer Tokens
 */
export class CsrfTokenManager {
  constructor(secretKey = crypto.randomBytes(32).toString('hex')) {
    this.secretKey = secretKey;
  }

  /**
   * Generates a signed CSRF token bound to a user's session ID
   * @param {string} sessionId
   * @param {number} ttlMs
   * @returns {string} Token format: `${sessionId}.${expiresAt}.${hmac}`
   */
  generateToken(sessionId, ttlMs = 3600000) {
    const expiresAt = Date.now() + ttlMs;
    const dataToSign = `${sessionId}.${expiresAt}`;
    const hmac = crypto.createHmac('sha256', this.secretKey).update(dataToSign).digest('hex');
    return `${dataToSign}.${hmac}`;
  }

  /**
   * Validates a CSRF token using constant-time comparison to defeat timing attacks
   * @param {string} token
   * @param {string} sessionId
   * @returns {boolean}
   */
  validateToken(token, sessionId) {
    if (!token || typeof token !== 'string') return false;
    const parts = token.split('.');
    if (parts.length !== 3) return false;

    const [tokenSessionId, expiresAtStr, receivedHmac] = parts;

    // Session binding check
    if (tokenSessionId !== sessionId) return false;

    // Expiry check
    const expiresAt = Number(expiresAtStr);
    if (isNaN(expiresAt) || Date.now() > expiresAt) return false;

    // Recompute HMAC
    const dataToSign = `${tokenSessionId}.${expiresAtStr}`;
    const expectedHmac = crypto.createHmac('sha256', this.secretKey).update(dataToSign).digest('hex');

    // Constant-time comparison
    const bufReceived = Buffer.from(receivedHmac, 'hex');
    const bufExpected = Buffer.from(expectedHmac, 'hex');

    if (bufReceived.length !== bufExpected.length) return false;
    return crypto.timingSafeEqual(bufReceived, bufExpected);
  }
}

/**
 * IDOR / BOLA Access Control Verifier
 */
export class IdorAccessController {
  /**
   * Enforces server-side tenant/user ownership scoping
   * @param {Object} resource Document/Resource object from database
   * @param {string} currentUserId Authenticated user ID from validated session
   * @param {string} currentUserRole Role ('user', 'admin')
   * @returns {boolean}
   */
  static canAccess(resource, currentUserId, currentUserRole = 'user') {
    if (!resource) return false;
    if (currentUserRole === 'admin') return true;
    return resource.ownerId === currentUserId;
  }
}
