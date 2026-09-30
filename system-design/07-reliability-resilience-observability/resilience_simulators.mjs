// Module 07: Distributed Reliability, Resilience & Observability Simulators

/**
 * 1. Circuit Breaker State Machine (Closed -> Open -> Half-Open)
 */
export class CircuitBreaker {
  constructor({
    failureThreshold = 0.5, // 50% failures trigger open
    recoveryTimeMs = 1000,
    windowSize = 10
  } = {}) {
    this.failureThreshold = failureThreshold;
    this.recoveryTimeMs = recoveryTimeMs;
    this.windowSize = windowSize;
    this.state = 'CLOSED'; // 'CLOSED' | 'OPEN' | 'HALF_OPEN'
    this.history = []; // boolean: true = success, false = failure
    this.nextAttempt = 0;
  }

  async execute(action, fallback = null) {
    const now = Date.now();

    if (this.state === 'OPEN') {
      if (now >= this.nextAttempt) {
        this.state = 'HALF_OPEN';
      } else {
        if (fallback) return fallback();
        throw new Error('CircuitBreakerOpenException: Downstream call rejected');
      }
    }

    try {
      const result = await action();
      this._onSuccess();
      return result;
    } catch (err) {
      this._onFailure();
      if (fallback) return fallback(err);
      throw err;
    }
  }

  _onSuccess() {
    if (this.state === 'HALF_OPEN') {
      this.state = 'CLOSED';
      this.history = [];
    } else {
      this.history.push(true);
      if (this.history.length > this.windowSize) this.history.shift();
    }
  }

  _onFailure() {
    if (this.state === 'HALF_OPEN') {
      this.state = 'OPEN';
      this.nextAttempt = Date.now() + this.recoveryTimeMs;
    } else {
      this.history.push(false);
      if (this.history.length > this.windowSize) this.history.shift();

      const failures = this.history.filter(res => !res).length;
      const rate = failures / this.history.length;

      if (this.history.length >= 4 && rate >= this.failureThreshold) {
        this.state = 'OPEN';
        this.nextAttempt = Date.now() + this.recoveryTimeMs;
      }
    }
  }
}

/**
 * 2. Exponential Backoff with Full Jitter Calculator
 */
export class BackoffPolicy {
  static getFullJitterDelay(attempt, baseDelayMs = 100, maxDelayMs = 5000) {
    const exponential = Math.min(maxDelayMs, baseDelayMs * Math.pow(2, attempt));
    return Math.floor(Math.random() * exponential);
  }
}

/**
 * 3. W3C Trace Context Propagation (traceparent)
 */
export class W3CTraceContext {
  static generateRandomHex(byteCount) {
    const chars = '0123456789abcdef';
    let str = '';
    for (let i = 0; i < byteCount * 2; i++) {
      str += chars[Math.floor(Math.random() * chars.length)];
    }
    return str;
  }

  static createRootHeader(sampled = true) {
    const traceId = this.generateRandomHex(16); // 32 hex chars
    const spanId = this.generateRandomHex(8);   // 16 hex chars
    const flags = sampled ? '01' : '00';
    return `00-${traceId}-${spanId}-${flags}`;
  }

  static parse(header) {
    const parts = header.split('-');
    if (parts.length !== 4 || parts[0] !== '00') {
      throw new Error('Invalid W3C traceparent header format');
    }
    return {
      version: parts[0],
      traceId: parts[1],
      parentSpanId: parts[2],
      sampled: parts[3] === '01'
    };
  }

  static createChildSpan(parentHeader) {
    const parsed = this.parse(parentHeader);
    const newSpanId = this.generateRandomHex(8);
    const flags = parsed.sampled ? '01' : '00';
    return {
      spanId: newSpanId,
      traceId: parsed.traceId,
      parentSpanId: parsed.parentSpanId,
      header: `00-${parsed.traceId}-${newSpanId}-${flags}`
    };
  }
}

/**
 * 4. Conflict-Free Replicated Data Type: PN-Counter (Positive-Negative Counter)
 */
export class PNCounterCRDT {
  constructor(nodeId) {
    this.nodeId = nodeId;
    this.P = new Map(); // nodeId -> positive increments
    this.N = new Map(); // nodeId -> negative decrements
  }

  increment(val = 1) {
    if (val < 0) throw new Error('Value must be positive');
    this.P.set(this.nodeId, (this.P.get(this.nodeId) || 0) + val);
  }

  decrement(val = 1) {
    if (val < 0) throw new Error('Value must be positive');
    this.N.set(this.nodeId, (this.N.get(this.nodeId) || 0) + val);
  }

  value() {
    let positiveSum = 0;
    for (const v of this.P.values()) positiveSum += v;
    let negativeSum = 0;
    for (const v of this.N.values()) negativeSum += v;
    return positiveSum - negativeSum;
  }

  merge(otherCounter) {
    const merged = new PNCounterCRDT(this.nodeId);
    const allPKeys = new Set([...this.P.keys(), ...otherCounter.P.keys()]);
    for (const k of allPKeys) {
      merged.P.set(k, Math.max(this.P.get(k) || 0, otherCounter.P.get(k) || 0));
    }

    const allNKeys = new Set([...this.N.keys(), ...otherCounter.N.keys()]);
    for (const k of allNKeys) {
      merged.N.set(k, Math.max(this.N.get(k) || 0, otherCounter.N.get(k) || 0));
    }
    return merged;
  }
}

/**
 * 5. SWIM Failure Detection Protocol Simulator
 */
export class SWIMClusterSimulator {
  constructor() {
    this.nodes = new Map(); // nodeId -> { status: 'ALIVE' | 'SUSPECT' | 'DEAD', reachable: boolean }
  }

  addNode(id, reachable = true) {
    this.nodes.set(id, { status: 'ALIVE', reachable });
  }

  pingDirect(sourceId, targetId) {
    const target = this.nodes.get(targetId);
    if (!target) return false;
    return target.reachable;
  }

  pingIndirect(sourceId, targetId, intermediaries) {
    // If direct ping failed, ask intermediaries to ping target
    for (const proxyId of intermediaries) {
      if (proxyId === sourceId || proxyId === targetId) continue;
      const proxy = this.nodes.get(proxyId);
      if (proxy && proxy.reachable) {
        if (this.pingDirect(proxyId, targetId)) {
          return true; // Indirect ping succeeded!
        }
      }
    }
    return false;
  }

  evaluateNodeHealth(sourceId, targetId, intermediaries) {
    if (this.pingDirect(sourceId, targetId)) {
      return 'ALIVE';
    }
    const indirectSuccess = this.pingIndirect(sourceId, targetId, intermediaries);
    if (indirectSuccess) {
      return 'ALIVE'; // Network route issue between source & target, target is still alive
    }
    // Both direct & indirect failed
    this.nodes.get(targetId).status = 'SUSPECT';
    return 'SUSPECT';
  }
}
