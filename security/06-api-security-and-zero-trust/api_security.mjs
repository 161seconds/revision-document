// Module 06: API Security, Authorization & Zero Trust Engines
import crypto from 'node:crypto';

/**
 * 1. Webhook HMAC-SHA256 Signature Verification with Timestamp Replay Protection
 */
export class WebhookSecurityManager {
  static createHeader(secret, rawBody, timestamp = Math.floor(Date.now() / 1000)) {
    const payload = `${timestamp}.${rawBody}`;
    const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex');
    return `t=${timestamp},v1=${signature}`;
  }

  static verify(secret, rawBody, header, toleranceSeconds = 300) {
    if (!header) throw new Error('Missing signature header');

    const elements = header.split(',');
    let timestamp = null;
    let signature = null;

    for (const elem of elements) {
      const [key, value] = elem.split('=');
      if (key === 't') timestamp = parseInt(value, 10);
      if (key === 'v1') signature = value;
    }

    if (!timestamp || !signature) {
      throw new Error('Malformed signature header');
    }

    const now = Math.floor(Date.now() / 1000);
    if (Math.abs(now - timestamp) > toleranceSeconds) {
      throw new Error(`Timestamp out of tolerance window (${toleranceSeconds}s)`);
    }

    const payload = `${timestamp}.${rawBody}`;
    const expectedSig = crypto.createHmac('sha256', secret).update(payload).digest('hex');

    const sigBuf = Buffer.from(signature, 'hex');
    const expectedBuf = Buffer.from(expectedSig, 'hex');

    if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
      throw new Error('Invalid signature HMAC mismatch');
    }

    return true;
  }
}

/**
 * 2. Mass Assignment Sanitizer (DTO Whitelist Enforcer)
 */
export class MassAssignmentSanitizer {
  static sanitize(inputObject, allowedKeys) {
    const sanitized = {};
    const allowedSet = new Set(allowedKeys);

    for (const key of Object.keys(inputObject)) {
      if (allowedSet.has(key)) {
        sanitized[key] = inputObject[key];
      }
    }
    return sanitized;
  }
}

/**
 * 3. ReBAC (Relationship-Based Access Control / Google Zanzibar) Evaluator
 */
export class ZanzibarReBAC {
  constructor() {
    this.tuples = new Set(); // "object#relation@user"
    this.relationHierarchy = new Map(); // e.g. "owner" implies "editor", "editor" implies "viewer"
  }

  addTuple(object, relation, user) {
    this.tuples.add(`${object}#${relation}@${user}`);
  }

  defineInheritance(higherRelation, lowerRelation) {
    if (!this.relationHierarchy.has(higherRelation)) {
      this.relationHierarchy.set(higherRelation, new Set());
    }
    this.relationHierarchy.get(higherRelation).add(lowerRelation);
  }

  check(object, requiredRelation, user) {
    // 1. Direct tuple match
    if (this.tuples.has(`${object}#${requiredRelation}@${user}`)) {
      return true;
    }

    // 2. Check if user holds a higher relation that inherits requiredRelation
    for (const [higherRel, impliedRels] of this.relationHierarchy.entries()) {
      if (impliedRels.has(requiredRelation)) {
        if (this.check(object, higherRel, user)) {
          return true;
        }
      }
    }

    return false;
  }
}

/**
 * 4. ABAC (Attribute-Based Access Control) Contextual Engine
 */
export class ABACEngine {
  constructor() {
    this.policies = [];
  }

  addPolicy({ name, effect = 'ALLOW', condition }) {
    this.policies.push({ name, effect, condition });
  }

  evaluate({ subject, resource, action, environment }) {
    for (const policy of this.policies) {
      if (policy.condition({ subject, resource, action, environment })) {
        return policy.effect === 'ALLOW';
      }
    }
    return false; // Default Deny
  }
}

/**
 * 5. Strict CORS Origin Validator
 */
export class CORSOriginValidator {
  constructor(allowedDomains = []) {
    this.allowedDomains = new Set(allowedDomains);
  }

  isAllowed(origin) {
    if (!origin || origin === 'null') return false; // Reject null origin (file:// or sandboxed iframes)
    if (this.allowedDomains.has(origin)) return true;

    // Subdomain matching: https://*.mycompany.com
    try {
      const url = new URL(origin);
      for (const domain of this.allowedDomains) {
        if (domain.startsWith('*.')) {
          const base = domain.slice(2);
          if (url.hostname.endsWith('.' + base)) {
            return true;
          }
        }
      }
    } catch {
      return false;
    }

    return false;
  }
}
