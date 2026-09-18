// Production-Grade Event Streaming, Partitioning, Circuit Breaker & Rate Limiter Algorithms
import crypto from 'node:crypto';

/**
 * Kafka-style Partitioned Log Simulator
 */
export class KafkaPartitionSimulator {
  constructor(partitionCount = 4) {
    if (partitionCount <= 0) throw new Error('Partition count must be positive');
    this.partitionCount = partitionCount;
    this.partitions = Array.from({ length: partitionCount }, () => []);
    this.consumerAssignments = new Map(); // consumerId -> [partitionIndices]
    this.committedOffsets = new Map(); // `${consumerId}:${partitionIdx}` -> offset
  }

  /**
   * Deterministically routes message to partition by key hash
   * @param {string|null} key
   * @param {*} payload
   */
  publish(key, payload) {
    let partitionIdx = 0;
    if (key !== null && key !== undefined) {
      const hash = crypto.createHash('sha256').update(String(key)).digest();
      partitionIdx = hash.readUInt32BE(0) % this.partitionCount;
    }

    const partition = this.partitions[partitionIdx];
    const offset = partition.length;
    const message = {
      offset,
      partition: partitionIdx,
      key,
      payload,
      timestamp: Date.now(),
    };

    partition.push(message);
    return { partition: partitionIdx, offset };
  }

  /**
   * Rebalances partitions across active consumers in a consumer group
   * @param {string[]} consumerIds
   */
  rebalance(consumerIds) {
    this.consumerAssignments.clear();

    if (consumerIds.length === 0) return this.consumerAssignments;

    // Distribute partitions round-robin among active consumers
    for (let p = 0; p < this.partitionCount; p++) {
      if (p < consumerIds.length) {
        const assignedConsumer = consumerIds[p % consumerIds.length];
        const current = this.consumerAssignments.get(assignedConsumer) || [];
        current.push(p);
        this.consumerAssignments.set(assignedConsumer, current);
      } else {
        // More partitions than consumers: wrap around
        const assignedConsumer = consumerIds[p % consumerIds.length];
        const current = this.consumerAssignments.get(assignedConsumer) || [];
        current.push(p);
        this.consumerAssignments.set(assignedConsumer, current);
      }
    }

    // Explicitly record idle consumers if consumers > partitions
    for (const consumerId of consumerIds) {
      if (!this.consumerAssignments.has(consumerId)) {
        this.consumerAssignments.set(consumerId, []); // IDLE
      }
    }

    return this.consumerAssignments;
  }
}

/**
 * Enterprise Circuit Breaker Pattern (Closed -> Open -> Half-Open -> Closed)
 */
export class CircuitBreaker {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 3;
    this.recoveryTimeoutMs = options.recoveryTimeoutMs || 1000;
    this.state = 'CLOSED'; // 'CLOSED' | 'OPEN' | 'HALF_OPEN'
    this.consecutiveFailures = 0;
    this.consecutiveSuccesses = 0;
    this.nextAttempt = Date.now();
  }

  async execute(actionFn, fallbackFn = null) {
    const now = Date.now();

    if (this.state === 'OPEN') {
      if (now >= this.nextAttempt) {
        this.state = 'HALF_OPEN';
      } else {
        if (fallbackFn) return fallbackFn();
        throw new Error('CircuitBreakerOpenException: Service unavailable');
      }
    }

    try {
      const result = await actionFn();
      this._onSuccess();
      return result;
    } catch (err) {
      this._onFailure();
      if (fallbackFn) return fallbackFn();
      throw err;
    }
  }

  _onSuccess() {
    this.consecutiveFailures = 0;
    if (this.state === 'HALF_OPEN') {
      this.consecutiveSuccesses++;
      if (this.consecutiveSuccesses >= 2) {
        this.state = 'CLOSED';
        this.consecutiveSuccesses = 0;
      }
    }
  }

  _onFailure() {
    this.consecutiveFailures++;
    this.consecutiveSuccesses = 0;
    if (this.state === 'HALF_OPEN' || this.consecutiveFailures >= this.failureThreshold) {
      this.state = 'OPEN';
      this.nextAttempt = Date.now() + this.recoveryTimeoutMs;
    }
  }
}

/**
 * Token Bucket Rate Limiter
 */
export class TokenBucketRateLimiter {
  /**
   * @param {number} capacity Max tokens bucket can hold (Burst allowance)
   * @param {number} refillRatePerSecond Tokens added per second
   */
  constructor(capacity, refillRatePerSecond) {
    this.capacity = capacity;
    this.refillRate = refillRatePerSecond;
    this.tokens = capacity;
    this.lastRefillTimestamp = Date.now();
  }

  _refill() {
    const now = Date.now();
    const elapsedSeconds = (now - this.lastRefillTimestamp) / 1000;
    const tokensToAdd = elapsedSeconds * this.refillRate;

    if (tokensToAdd > 0) {
      this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd);
      this.lastRefillTimestamp = now;
    }
  }

  tryConsume(count = 1) {
    this._refill();
    if (this.tokens >= count) {
      this.tokens -= count;
      return true; // Allowed
    }
    return false; // Rate limited
  }
}
